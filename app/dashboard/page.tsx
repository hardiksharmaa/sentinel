import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MonitorForm from "./monitor-form";
import Link from "next/link";
import { Activity} from "lucide-react";

export default async function Dashboard() {
  // 1. Secure the Page: Check if user is logged in
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin"); // Kick them out if not logged in
  }

  // 2. Fetch the User's Monitors from DB
  const monitors = await prisma.monitor.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { checks: { take: 10, orderBy: { createdAt: "desc" } } } // Get last 10 checks for graphs
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600">
            <Activity size={24} />
            Sentinel
          </div>
        <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user?.name}</span>
            {/* Simple User Avatar */}
            <img 
                src={session.user?.image || ""} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full border"
            />
        </div>
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