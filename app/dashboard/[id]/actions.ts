"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Resend } from 'resend';
import { invalidateCache } from "@/lib/redis";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function triggerCheck(monitorId: string, url: string) {
  const session = await getServerSession(authOptions);
  
  const user = session?.user as { id: string; email?: string } | undefined;

  if (!user?.id) return { error: "Unauthorized" };

  const monitor = await prisma.monitor.findUnique({
    where: { id: monitorId },
    select: { status: true, user: { select: { email: true } } }
  });

  if (!monitor) return { error: "Monitor not found" };

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

  await prisma.monitorCheck.create({
    data: {
      monitorId,
      statusCode,
      latency,
    },
  });

  await prisma.monitor.update({
    where: { id: monitorId },
    data: { 
      status: newStatus,
      lastCheck: new Date()
    },
  });

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

  await invalidateCache(`dashboard:monitor:${monitorId}`);
  await invalidateCache(`dashboard:monitors:${user.id}`);

  revalidatePath(`/dashboard/${monitorId}`);
}

export async function deleteMonitor(monitorId: string) {
  const session = await getServerSession(authOptions);
  
  const user = session?.user as { id: string } | undefined;
  
  if (!user?.id) return { error: "Unauthorized" };

  const monitor = await prisma.monitor.findFirst({
    where: { id: monitorId, userId: user.id }
  });

  if (!monitor) return { error: "Not found" };

  await prisma.monitor.delete({
    where: { id: monitorId }
  });

  await invalidateCache(`dashboard:monitors:${user.id}`);
  await invalidateCache(`dashboard:monitor:${monitorId}`);

  redirect("/dashboard");
}