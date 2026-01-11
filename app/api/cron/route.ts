// app/api/cron/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  // 1. Security Check: Prevent random people from triggering this
  // We will set this secret in Vercel later
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Get all Active monitors & their users
    const monitors = await prisma.monitor.findMany({
      where: { active: true },
      select: { 
        id: true, 
        url: true, 
        status: true, 
        user: { select: { email: true } } 
      }
    });

    // 3. Loop through them in parallel
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

        // Save Check
        await prisma.monitorCheck.create({
            data: {
                monitorId: monitor.id,
                statusCode: statusCode,
                latency: latency
            }
        });

        // Update Monitor Status
        if (monitor.status !== newStatus) {
            await prisma.monitor.update({
                where: { id: monitor.id },
                data: { status: newStatus, lastCheck: new Date() }
            });

            // SEND ALERT (Only if going DOWN)
            if (newStatus === "DOWN" && monitor.user.email) {
                await resend.emails.send({
                    from: 'onboarding@resend.dev',
                    to: monitor.user.email,
                    subject: `🔴 Alert: ${monitor.url} is DOWN`,
                    html: `<p>Your monitor for <strong>${monitor.url}</strong> is down (Status: ${statusCode}).</p>`
                });
            }
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