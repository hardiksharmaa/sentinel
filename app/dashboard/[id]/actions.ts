// app/dashboard/[id]/actions.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function triggerCheck(monitorId: string, url: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const start = Date.now();
  let status = 200;

  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    status = res.status;
  } catch (e) {
    status = 500;
  }

  const latency = Date.now() - start;

  // Save the check
  await prisma.monitorCheck.create({
    data: {
      monitorId,
      statusCode: status,
      latency,
    },
  });

  // Update Monitor Status
  await prisma.monitor.update({
    where: { id: monitorId },
    data: { 
      status: status >= 400 ? "DOWN" : "UP",
      lastCheck: new Date()
    },
  });

  revalidatePath(`/dashboard/${monitorId}`);
}

export async function deleteMonitor(monitorId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  // Verify ownership before deleting
  const monitor = await prisma.monitor.findFirst({
    where: { id: monitorId, userId: session.user.id }
  });

  if (!monitor) return { error: "Not found" };

  await prisma.monitor.delete({
    where: { id: monitorId }
  });

  redirect("/dashboard");
}