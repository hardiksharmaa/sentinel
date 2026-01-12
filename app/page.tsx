import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LandingClient from "@/components/landing-client";
import Navbar from "@/components/navbar";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  // Fetch full user data if logged in
  const user = session?.user?.id 
    ? await prisma.user.findUnique({ where: { id: session.user.id } }) 
    : null;

  return (
    <>
      <Navbar user={user} />
      <LandingClient session={session} />
    </>
  );
}