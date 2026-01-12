import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AccountForm from "./account-form"; // <--- We import the client component

export default async function SettingsAccountPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch fresh user data from DB
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return null;

  // Render the Client Component and pass the data to it
  return <AccountForm user={user} />;
}