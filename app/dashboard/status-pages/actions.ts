"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { invalidateCache } from "@/lib/redis"; 

export async function createStatusPage(formData: FormData) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string } | undefined;

  if (!user?.id) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  
  const selectedMonitorIds = formData.getAll("monitors") as string[];

  if (!title || !slug) {
    return { error: "Title and Slug are required" };
  }

  const existing = await prisma.statusPage.findUnique({
    where: { slug: slug }
  });

  if (existing) {
    return { error: "This URL is already taken. Please choose another." };
  }

  await prisma.statusPage.create({
    data: {
      userId: user.id,
      title: title,
      slug: slug,
      description: description,
      monitors: {
        connect: selectedMonitorIds.map((id) => ({ id }))
      }
    }
  });

  await invalidateCache(`dashboard:status-pages:${user.id}`);

  revalidatePath("/dashboard/status-pages");
  redirect("/dashboard/status-pages");
}

export async function deleteStatusPage(id: string) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string } | undefined;
  if (!user?.id) return { error: "Unauthorized" };

  const page = await prisma.statusPage.findUnique({
    where: { id: id, userId: user.id }
  });

  if (!page) return { error: "Not found" };

  await prisma.statusPage.delete({
    where: { id: id }
  });

  await invalidateCache(`dashboard:status-pages:${user.id}`);
  
  await invalidateCache(`status_page:${page.slug}`);

  revalidatePath("/dashboard/status-pages");
}