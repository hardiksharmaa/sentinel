import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = 'force-dynamic'; // <--- Force this route to never cache

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  // 1. Security Check
  if (secret !== process.env.CRON_SECRET) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const monitors = await prisma.monitor.findMany({
      where: { active: true },
      select: { 
        id: true, 
        url: true, 
        status: true, 
        user: { select: { email: true } } 
      }
    });

    const results = await Promise.all(
      monitors.map(async (monitor) => {
        const start = Date.now();
        let newStatus = "UP";
        let statusCode = 200;

        try {
            const response = await fetch(monitor.url, { method: "HEAD", cache: 'no-store' });
            statusCode = response.status;
            if (response.status >= 400) newStatus = "DOWN";
        } catch (error) {
            newStatus = "DOWN";
            statusCode = 500;
        }

        const latency = Date.now() - start;

        // 2. Save History Check (Always)
        await prisma.monitorCheck.create({
            data: {
                monitorId: monitor.id,
                statusCode: statusCode,
                latency: latency
            }
        });

        // 3. Update Monitor "Last Checked" (ALWAYS update this!)
        // We moved this OUTSIDE the "if status changed" block
        await prisma.monitor.update({
            where: { id: monitor.id },
            data: { 
                status: newStatus, 
                lastCheck: new Date() // <--- Now updates every 5 mins
            }
        });

        // 4. Send Alert (Only if status CHANGED to DOWN)
        if (monitor.status === "UP" && newStatus === "DOWN" && monitor.user.email) {
            await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: monitor.user.email,
                subject: `🔴 Alert: ${monitor.url} is DOWN`,
                html: `<p>Your monitor for <strong>${monitor.url}</strong> is down (Status: ${statusCode}).</p>`
            });
        }

        return { id: monitor.id, url: monitor.url, status: newStatus };
      })
    );

    return NextResponse.json({ success: true, checked: results.length });

  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}