import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import AddSSLModal from "./add-modal";
import SSLCard from "./ssl-card";

export default async function SSLDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  // Fetch SSL Monitors
  const monitors = await prisma.sSLMonitor.findMany({
    where: { userId: session.user.id },
    orderBy: { daysRemaining: "asc" }
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. Global Navbar */}
      <Navbar user={user} />

      <main className="max-w-5xl mx-auto mt-10 px-6">
        
        {/* 2. Navigation Tabs */}
        <div className="mb-8 border-b border-gray-200">
            <div className="flex gap-8">
                <Link href="/dashboard" className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm transition">
                    Monitors
                </Link>
                <Link href="/dashboard/status-pages" className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm transition">
                    Status Pages
                </Link>
                <Link href="/dashboard/ssl" className="pb-3 border-b-2 border-blue-600 text-blue-600 font-medium text-sm">
                    SSL Certificates
                </Link>
            </div>
        </div>

        {/* 3. Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SSL Monitoring</h1>
            <p className="text-gray-500 mt-1">Track certificate expiry to prevent downtime.</p>
          </div>
          <AddSSLModal />
        </div>

        {/* 4. Monitor List */}
        {monitors.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
             <h3 className="text-lg font-medium text-gray-900">No domains monitored</h3>
             <p className="text-gray-500 mb-6">Add a domain to start tracking its SSL expiry.</p>
           </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {monitors.map((m) => (
                <SSLCard key={m.id} monitor={m} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}