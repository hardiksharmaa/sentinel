// app/dashboard/actions.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 1. Define the Validation Schema
const MonitorSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  url: z.string().url("Must be a valid URL (e.g., https://google.com)"),
});

export async function createMonitor(formData: FormData) {
  // 2. Check Authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  // 3. Validate Input
  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  
  const validated = MonitorSchema.safeParse({ name, url });
  
  if (!validated.success) {
    return { error: validated.error.format() };
  }

  // 4. Save to Database
  try {
    await prisma.monitor.create({
      data: {
        name: validated.data.name,
        url: validated.data.url,
        userId: session.user.id,
        status: "UP", // Default status
      },
    });

    // 5. Refresh the Dashboard (so the new monitor shows up instantly)
    revalidatePath("/dashboard");
    return { success: true };

  } catch (error) {
    return { error: "Failed to create monitor" };
  }
}