import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { Resend } from "resend";
import tls from "tls";

export const dynamic = 'force-dynamic';

const sqs = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const resend = new Resend(process.env.RESEND_API_KEY);

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
      rejectUnauthorized: false,
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
  if (searchParams.get("secret") !== process.env.CRON_SECRET) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const monitors = await prisma.monitor.findMany({
      where: { active: true },
      select: { id: true, url: true }
    });

    if (monitors.length > 0) {
        const batchSize = 10;
        for (let i = 0; i < monitors.length; i += batchSize) {
            const batch = monitors.slice(i, i + batchSize);
            const entries = batch.map((monitor) => ({
                Id: monitor.id,
                MessageBody: JSON.stringify({ 
                    monitorId: monitor.id, 
                    url: monitor.url 
                }),
            }));
            await sqs.send(new SendMessageBatchCommand({
                QueueUrl: process.env.AWS_SQS_QUEUE_URL,
                Entries: entries,
            }));
        }
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await prisma.monitorCheck.deleteMany({
      where: { createdAt: { lt: sevenDaysAgo } }
    });

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sslMonitors = await prisma.sSLMonitor.findMany({
      where: { lastCheck: { lt: yesterday } },
      include: { user: true }
    });

    const sslResults = await Promise.all(
        sslMonitors.map(async (ssl) => {
            const details = await getCertificateDetails(ssl.domain);
            
            let status = "HEALTHY";
            if (details.error) status = "ERROR";
            else if (details.daysRemaining < 3) status = "EXPIRED";
            else if (details.daysRemaining < 7) status = "EXPIRING";
      
            await prisma.sSLMonitor.update({
              where: { id: ssl.id },
              data: {
                daysRemaining: details.daysRemaining,
                issuer: details.issuer,
                validTo: details.validTo,
                validFrom: details.validFrom,
                status: status,
                error: details.error,
                lastCheck: new Date(), 
              },
            });
      
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
            return { id: ssl.id, status };
        })
    );

    return NextResponse.json({ 
        success: true, 
        queued: monitors.length,
        sslChecked: sslResults.length 
    });

  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}