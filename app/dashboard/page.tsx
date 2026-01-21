import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MonitorForm from "./monitor-form";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { getCachedData, DB_CACHE_TTL, getCachedUser } from "@/lib/redis";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login"); 
  }

  const freshUser = await getCachedUser(session.user.id);

  if (!freshUser) redirect("/login");
  
  const cacheKey = `dashboard:monitors:${session.user.id}`;

  const monitors = await getCachedData(
    cacheKey,
    async () => {
      return await prisma.monitor.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: { 
          checks: { 
            take: 20,
            orderBy: { createdAt: "desc" } 
          } 
        } 
      });
    },
    DB_CACHE_TTL 
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      <Navbar user={freshUser} />

      <main className="max-w-5xl mx-auto mt-10 px-6">
        
        <div className="mb-8 border-b border-gray-200">
            <div className="flex gap-8">
                <Link 
                    href="/dashboard" 
                    className="pb-3 border-b-2 border-blue-600 text-blue-600 font-medium text-sm"
                >
                    Monitors
                </Link>
                <Link 
                    href="/dashboard/status-pages" 
                    className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm transition"
                >
                    Status Pages
                </Link>
                <Link 
                    href="/dashboard/ssl" 
                    className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm transition"
                >
                    SSL Certificates
                </Link>
            </div>
        </div>

        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Your Monitors</h1>
            <MonitorForm />
        </div>

        {monitors.length === 0 ? (
            <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray-500 mb-2">No monitors found.</p>
                <p className="text-sm text-gray-400">Add your first website to start tracking.</p>
            </div>
        ) : (
            <div className="grid gap-4">
                {monitors.map((monitor) => {
                  const historyChecks = [...monitor.checks].reverse();
                  const emptySlots = Array(20 - historyChecks.length).fill(null);

                  return (
                    <Link 
                      href={`/dashboard/${monitor.id}`} 
                      key={monitor.id} 
                      className="block bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        
                        <div className="flex items-start gap-4">
                          <div className="relative flex h-3 w-3 mt-1.5 flex-shrink-0">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                monitor.status === 'UP' ? 'bg-green-400' : 'bg-red-400'
                            }`}></span>
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${
                                monitor.status === 'UP' ? 'bg-green-500' : 'bg-red-500'
                            }`}></span>
                          </div>

                          <div>
                            <h3 className="font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                                {monitor.name || "Untitled Monitor"}
                            </h3>
                            <div className="text-sm text-gray-400 mt-1 truncate max-w-[200px] sm:max-w-xs">
                                {monitor.url}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                           <div className="flex items-center gap-1 h-6">
                               {emptySlots.map((_, i) => (
                                   <div key={`empty-${i}`} className="w-1.5 h-4 bg-gray-100 rounded-full" />
                               ))}
                               {historyChecks.map((check) => {
                                   const isSuccess = check.statusCode >= 200 && check.statusCode < 300;
                                   return (
                                       <div 
                                          key={check.id}
                                          title={`Status: ${check.statusCode} | Latency: ${check.latency}ms`}
                                          className={`w-1.5 h-6 rounded-full transition-all hover:scale-110 ${
                                              isSuccess ? 'bg-green-400' : 'bg-red-500'
                                          }`}
                                       />
                                   );
                               })}
                           </div>
                           <div className="flex items-center gap-2">
                               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                   Last 20 Checks
                               </span>
                               <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                   monitor.status === 'UP' 
                                   ? 'bg-green-50 text-green-700 border-green-200' 
                                   : 'bg-red-50 text-red-700 border-red-200'
                               }`}>
                                 {monitor.status}
                               </span>
                           </div>
                        </div>

                      </div>
                    </Link>
                  );
                })}
            </div>
        )}
      </main>
    </div>
  );
}