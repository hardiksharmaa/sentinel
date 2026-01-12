import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MonitorForm from "./monitor-form";
import Link from "next/link";
import { Activity } from "lucide-react";
import UserDropdown from "./user-dropdown";

export default async function Dashboard() {
  // 1. Secure the Page
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login"); 
  }

  // 2. Fetch Fresh User Data (Fixes the name update issue)
  const freshUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  // If user is deleted but session remains, kick them out
  if (!freshUser) redirect("/login");

  // 3. Fetch the User's Monitors
  const monitors = await prisma.monitor.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { checks: { take: 10, orderBy: { createdAt: "desc" } } } 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 hover:opacity-80 transition">
            <Activity size={24} />
            Sentinel
        </Link>
        
        {/* Pass the FRESH user from DB, not the stale session */}
        <UserDropdown user={freshUser} />
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto mt-10 px-6">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Your Monitors</h1>
            <MonitorForm />
        </div>

        {/* List of Monitors */}
        {monitors.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray-500 mb-2">No monitors found.</p>
                <p className="text-sm text-gray-400">Add your first website to start tracking.</p>
            </div>
        ) : (
            // Real Data List
            <div className="grid gap-4">
                {monitors.map((monitor) => (
                  <Link 
                    href={`/dashboard/${monitor.id}`} 
                    key={monitor.id} 
                    className="block bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${monitor.status === 'UP' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <h3 className="font-semibold text-gray-900">{monitor.name}</h3>
                        </div>
                        <div className="text-sm text-gray-400">{monitor.url}</div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${monitor.status === 'UP' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {monitor.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
        )}
      </main>
    </div>
  );
}