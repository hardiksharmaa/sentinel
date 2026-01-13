"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createStatusPage(formData: FormData) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string } | undefined;

  if (!user?.id) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  
  // Get all selected monitor IDs (checkboxes)
  const selectedMonitorIds = formData.getAll("monitors") as string[];

  if (!title || !slug) {
    return { error: "Title and Slug are required" };
  }

  // 1. Check if Slug is unique (globally)
  const existing = await prisma.statusPage.findUnique({
    where: { slug: slug }
  });

  if (existing) {
    return { error: "This URL is already taken. Please choose another." };
  }

  // 2. Create the Status Page & Connect Monitors
  await prisma.statusPage.create({
    data: {
      userId: user.id,
      title: title,
      slug: slug,
      description: description,
      monitors: {
        // This magic connects the monitors to this new page
        connect: selectedMonitorIds.map((id) => ({ id }))
      }
    }
  });

  revalidatePath("/dashboard/status-pages");
  redirect("/dashboard/status-pages");
}

export async function deleteStatusPage(id: string) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string } | undefined;
  if (!user?.id) return { error: "Unauthorized" };

  await prisma.statusPage.delete({
    where: { id: id, userId: user.id }
  });

  revalidatePath("/dashboard/status-pages");
}