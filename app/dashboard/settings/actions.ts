"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// 1. Update User Name
export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string } | undefined;

  if (!user?.id) return { error: "Unauthorized" };

  const name = formData.get("name") as string;

  if (!name || name.trim().length < 2) {
    return { error: "Name must be at least 2 characters" };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { name },
    });
    revalidatePath("/dashboard/settings");
    return { success: "Profile updated successfully" };
  } catch (error) {
    return { error: "Failed to update profile" };
  }
}

// 2. Delete Account (The Danger Zone)
export async function deleteAccount() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string } | undefined;

  if (!user?.id) return { error: "Unauthorized" };

  try {
    // Delete the user (Cascade will delete their monitors/checks automatically if configured, 
    // but Prisma usually needs explicit cascade in schema or manual deletion. 
    // For now we assume standard User delete).
    await prisma.user.delete({
      where: { id: user.id },
    });
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete account" };
  }
}