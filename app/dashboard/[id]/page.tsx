import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Activity } from "lucide-react";
import UserDropdown from "../user-dropdown"; // Go up two levels to find this
import MonitorDetailsClient from "@/components/monitor-details-client";

export default async function MonitorDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");

  const { id } = await params;

  // 1. Fetch Fresh User (for Navbar)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) redirect("/login");

  // 2. Fetch Monitor Data
  const monitor = await prisma.monitor.findFirst({
    where: { 
      id: id, 
      userId: user.id 
    },
    include: {
      checks: {
        orderBy: { createdAt: "desc" },
        take: 50, // Fetch 50 for good graph history
      }
    }
  });

  if (!monitor) return notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* --- RESTORED NAVBAR --- */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 hover:opacity-80 transition">
            <Activity size={24} />
            Sentinel
        </Link>
        <UserDropdown user={user} />
      </nav>

      {/* Main Content */}
      <main>
        <MonitorDetailsClient monitor={monitor} />
      </main>
    </div>
  );
}