"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function triggerCheck(monitorId: string, url: string) {
  const session = await getServerSession(authOptions);
  
  // FORCE FIX: Manually tell TypeScript that 'id' exists
  const user = session?.user as { id: string; email?: string } | undefined;

  if (!user?.id) return { error: "Unauthorized" };

  // 1. Get the current status BEFORE checking
  const monitor = await prisma.monitor.findUnique({
    where: { id: monitorId },
    select: { status: true, user: { select: { email: true } } }
  });

  if (!monitor) return { error: "Monitor not found" };

  // 2. Perform the Check
  const start = Date.now();
  let newStatus = "UP";
  let statusCode = 200;

  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    statusCode = res.status;
    if (res.status >= 400) newStatus = "DOWN";
  } catch (e) {
    newStatus = "DOWN";
    statusCode = 500;
  }

  const latency = Date.now() - start;

  // 3. Save to History
  await prisma.monitorCheck.create({
    data: {
      monitorId,
      statusCode,
      latency,
    },
  });

  // 4. Update Monitor Status
  await prisma.monitor.update({
    where: { id: monitorId },
    data: { 
      status: newStatus,
      lastCheck: new Date()
    },
  });

  // 5. SEND ALERT? (Only if status changed from UP -> DOWN)
  if (monitor.status === "UP" && newStatus === "DOWN" && monitor.user.email) {
    console.log("⚠️ Site went down! Sending email...");
    
    await resend.emails.send({
      from: 'onboarding@resend.dev', 
      to: monitor.user.email,       
      subject: `🔴 Alert: ${url} is DOWN`,
      html: `
        <p>Your monitor for <strong>${url}</strong> just went down.</p>
        <p><strong>Status Code:</strong> ${statusCode}</p>
        <p>Please check your server immediately.</p>
      `
    });
  }

  revalidatePath(`/dashboard/${monitorId}`);
}

export async function deleteMonitor(monitorId: string) {
  const session = await getServerSession(authOptions);
  
  // FORCE FIX: Manually tell TypeScript that 'id' exists
  const user = session?.user as { id: string } | undefined;
  
  if (!user?.id) return { error: "Unauthorized" };

  // Verify ownership before deleting
  const monitor = await prisma.monitor.findFirst({
    where: { id: monitorId, userId: user.id }
  });

  if (!monitor) return { error: "Not found" };

  await prisma.monitor.delete({
    where: { id: monitorId }
  });

  redirect("/dashboard");
}