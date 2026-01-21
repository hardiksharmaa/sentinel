"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/redis"; 

const MonitorSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  url: z.string().url("Must be a valid URL (e.g., https://google.com)"),
});

export async function createMonitor(formData: FormData) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string } | undefined;
  if (!user?.id) return { error: "Not authenticated" };

  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  
  const validated = MonitorSchema.safeParse({ name, url });
  
  if (!validated.success) return { error: validated.error.format() };

  try {
    await prisma.monitor.create({
      data: {
        name: validated.data.name,
        url: validated.data.url,
        userId: user.id,
        status: "UP",
      },
    });

    await invalidateCache(`dashboard:monitors:${user.id}`);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create monitor" };
  }
}

export async function triggerCheck(id: string, url: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const start = Date.now();
  let status = "DOWN";
  let statusCode = 0;

  try {
    const res = await fetch(url, { 
        method: "HEAD", 
        cache: "no-store", 
        signal: AbortSignal.timeout(5000) 
    });
    statusCode = res.status;
    status = res.ok ? "UP" : "DOWN";
  } catch (e) {
    status = "DOWN";
    statusCode = 0; 
  }

  const latency = Date.now() - start;

  await prisma.monitorCheck.create({
    data: { monitorId: id, statusCode: statusCode, latency: latency }
  });
  
  await prisma.monitor.update({
    where: { id },
    data: { 
      status,
      lastCheck: new Date(),
      totalChecks: { increment: 1 }
    }
  });

  await invalidateCache(`dashboard:monitors:${session.user.id}`);
  await invalidateCache(`dashboard:monitor:${id}`);

  revalidatePath(`/dashboard/${id}`);
}

export async function deleteMonitor(id: string) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string } | undefined;
  if (!user?.id) return { error: "Unauthorized" };

  await prisma.monitor.delete({
    where: { id, userId: user.id },
  });

  await invalidateCache(`dashboard:monitors:${user.id}`);

  revalidatePath("/dashboard");
}

export async function updateProfileImage(base64Image: string | null) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: base64Image }, 
    });

    await invalidateCache(`user_profile:${session.user.id}`);

    revalidatePath("/"); 
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Profile Image Update Error:", error);
    return { error: "Failed to update image" };
  }
}