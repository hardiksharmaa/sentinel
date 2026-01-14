import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Activity } from "lucide-react";
import UserDropdown from "../user-dropdown";
import MonitorDetailsClient from "@/components/monitor-details-client";

// FORCE DYNAMIC: Never cache this page to ensure live data
export const dynamic = "force-dynamic"; 

export default async function MonitorDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");

  const { id } = await params;

  // 1. Fetch Fresh User
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) redirect("/login");

  // 2. Fetch Monitor Data + TOTAL COUNT
  const monitor = await prisma.monitor.findFirst({
    where: { 
      id: id, 
      userId: user.id 
    },
    include: {
      // Get the last 50 checks for the chart
      checks: {
        orderBy: { createdAt: "desc" },
        take: 50, 
      },
      // Get the TOTAL number of checks (aggregated count)
      _count: {
        select: { checks: true }
      }
    }
  });

  if (!monitor) return notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 hover:opacity-80 transition">
            <Activity size={24} />
            Sentinel
        </Link>
        <UserDropdown user={user} />
      </nav>

      <main>
        {/* Pass the real count explicitly to the client */}
        <MonitorDetailsClient 
          monitor={monitor} 
          totalChecks={monitor._count.checks} 
        />
      </main>
    </div>
  );
}