// app/api/cron/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Get all Active monitors
    const monitors = await prisma.monitor.findMany({
      where: { active: true }
    });

    // 2. Loop through them and check status
    // We use Promise.all to check them in parallel (faster)
    const results = await Promise.all(
      monitors.map(async (monitor) => {
        const start = Date.now();
        let status = "UP";
        let statusCode = 200;

        try {
            // The actual "Ping"
            const response = await fetch(monitor.url, { method: "HEAD" });
            statusCode = response.status;
            
            // If status is 4xx or 5xx, it's DOWN
            if (response.status >= 400) {
                status = "DOWN";
            }
        } catch (error) {
            // Network error (DNS failure, timeout) means DOWN
            status = "DOWN";
            statusCode = 500;
        }

        const latency = Date.now() - start;

        // 3. Save the result to Database
        await prisma.monitorCheck.create({
            data: {
                monitorId: monitor.id,
                statusCode: statusCode,
                latency: latency
            }
        });

        // 4. Update the Monitor's current status for the Dashboard
        await prisma.monitor.update({
            where: { id: monitor.id },
            data: { 
                status: status,
                lastCheck: new Date()
            }
        });

        return { id: monitor.id, url: monitor.url, status, latency };
      })
    );

    return NextResponse.json({ success: true, checked: results.length, results });

  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}