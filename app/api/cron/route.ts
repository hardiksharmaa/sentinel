import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import tls from "tls";

export const dynamic = 'force-dynamic'; // Force no-cache

const resend = new Resend(process.env.RESEND_API_KEY);

// --- HELPER: SSL Check Logic ---
async function getCertificateDetails(domain: string) {
  return new Promise<{
    issuer: string;
    daysRemaining: number;
    error?: string;
    validTo?: Date;
    validFrom?: Date;
  }>((resolve) => {
    const options = {
      host: domain,
      port: 443,
      servername: domain,
      rejectUnauthorized: false, // We just want to read the date
      timeout: 5000,
    };

    const socket = tls.connect(options, () => {
      const cert = socket.getPeerCertificate();
      if (!cert || Object.keys(cert).length === 0) {
        resolve({ issuer: "Unknown", daysRemaining: 0, error: "No certificate" });
        socket.end();
        return;
      }
      const validTo = new Date(cert.valid_to);
      const validFrom = new Date(cert.valid_from);
      const diffTime = validTo.getTime() - Date.now();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      resolve({
        issuer: (typeof cert.issuer === 'string') 
          ? cert.issuer 
          : (cert.issuer as any).O || "Unknown",
        daysRemaining,
        validTo,
        validFrom,
      });
      socket.end();
    });

    socket.on("error", (err) => resolve({ issuer: "Error", daysRemaining: 0, error: err.message }));
    socket.on("timeout", () => { socket.destroy(); resolve({ issuer: "Timeout", daysRemaining: 0, error: "Timeout" }); });
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  // 1. Security Check
  if (secret !== process.env.CRON_SECRET) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // =======================================================
    // JOB 1: UPTIME MONITORS (Runs every 5 minutes)
    // =======================================================
    const monitors = await prisma.monitor.findMany({
      where: { active: true },
      select: { 
        id: true, 
        url: true, 
        name: true,
        status: true, 
        user: { select: { email: true } } 
      }
    });

    const uptimeResults = await Promise.all(
      monitors.map(async (monitor) => {
        const start = Date.now();
        let newStatus = "UP";
        let statusCode = 200;

        try {
            const response = await fetch(monitor.url, { 
                method: "HEAD", 
                cache: 'no-store',
                signal: AbortSignal.timeout(5000) 
            });
            statusCode = response.status;
            if (response.status >= 400) newStatus = "DOWN";
        } catch (error) {
            newStatus = "DOWN";
            statusCode = 500;
        }

        const latency = Date.now() - start;

        // Save History
        await prisma.monitorCheck.create({
            data: {
                monitorId: monitor.id,
                statusCode: statusCode,
                latency: latency
            }
        });

        // Update Monitor Status & Last Check
        await prisma.monitor.update({
            where: { id: monitor.id },
            data: { 
                status: newStatus, 
                lastCheck: new Date()
            }
        });

        // Send Alert (Only if status CHANGED to DOWN)
        if (monitor.status === "UP" && newStatus === "DOWN" && monitor.user.email) {
            await resend.emails.send({
                from: 'Sentinel <onboarding@resend.dev>',
                to: monitor.user.email,
                subject: `🔴 Alert: ${monitor.name || monitor.url} is DOWN`,
                html: `<p>Your monitor for <strong>${monitor.url}</strong> is down (Status: ${statusCode}).</p>`
            });
        }

        return { id: monitor.id, status: newStatus };
      })
    );

    // =======================================================
    // JOB 2: SSL MONITORING (Runs once per day per domain)
    // =======================================================
    
    // Find SSL monitors not checked in the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const sslMonitors = await prisma.sSLMonitor.findMany({
      where: {
        lastCheck: { lt: yesterday }
      },
      include: { user: true }
    });

    const sslResults = await Promise.all(
        sslMonitors.map(async (ssl) => {
            const details = await getCertificateDetails(ssl.domain);
            
            let status = "HEALTHY";
            if (details.error) status = "ERROR";
            else if (details.daysRemaining < 3) status = "EXPIRED";
            else if (details.daysRemaining < 7) status = "EXPIRING";
      
            // Update Database
            await prisma.sSLMonitor.update({
              where: { id: ssl.id },
              data: {
                daysRemaining: details.daysRemaining,
                issuer: details.issuer,
                validTo: details.validTo,
                validFrom: details.validFrom,
                status: status,
                error: details.error,
                lastCheck: new Date(), // Reset the 24h timer
              },
            });
      
            // Alert if SSL is Expiring (and user has email)
            if ((status === "EXPIRING" || status === "EXPIRED") && ssl.user.email) {
              await resend.emails.send({
                from: "Sentinel <onboarding@resend.dev>",
                to: ssl.user.email,
                subject: `🔐 SSL Warning: ${ssl.domain} is ${status}`,
                html: `
                  <h3>SSL Certificate Alert</h3>
                  <p>The certificate for <b>${ssl.domain}</b> expires in <b>${details.daysRemaining} days</b>.</p>
                  <p>Please renew it immediately to avoid downtime.</p>
                `,
              });
            }
            return { id: ssl.id, days: details.daysRemaining };
        })
    );

    return NextResponse.json({ 
        success: true, 
        monitorsChecked: uptimeResults.length, 
        sslChecked: sslResults.length 
    });

  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}