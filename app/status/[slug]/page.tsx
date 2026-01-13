import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CheckCircle, XCircle, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

// Force dynamic so it always shows live data
export const dynamic = "force-dynamic";

export default async function PublicStatusPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

  // 1. Fetch the Page & Linked Monitors
  const statusPage = await prisma.statusPage.findUnique({
    where: { slug },
    include: {
      monitors: {
        where: { active: true }, // Only show active monitors
        orderBy: { createdAt: "asc" },
        include: {
            // Get last 60 checks for the "uptime bar" visualization
            checks: {
                take: 60,
                orderBy: { createdAt: "desc" }
            }
        }
      }
    }
  });

  if (!statusPage) return notFound();

  // 2. Calculate Overall System Status
  // If even one monitor is DOWN, the whole system is "Partially Degraded"
  const totalMonitors = statusPage.monitors.length;
  const downMonitors = statusPage.monitors.filter((m) => m.status === "DOWN");
  const isSystemOperational = downMonitors.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold">{statusPage.title}</h1>
             {statusPage.description && (
                <p className="text-gray-500 text-sm mt-1">{statusPage.description}</p>
             )}
           </div>
           {/* Branding Link (Good for your growth!) */}
           <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-blue-600 transition">
              <Activity size={16} /> Powered by Sentinel
           </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-10">
        
        {/* 1. GLOBAL STATUS BANNER */}
        <div className={`rounded-xl p-8 mb-10 flex flex-col items-center justify-center text-center shadow-sm border ${
            isSystemOperational 
                ? "bg-green-600 text-white border-green-700" 
                : "bg-red-600 text-white border-red-700"
        }`}>
            {isSystemOperational ? (
                <>
                    <CheckCircle size={64} className="mb-4 opacity-90" />
                    <h2 className="text-3xl font-bold">All Systems Operational</h2>
                </>
            ) : (
                <>
                    <XCircle size={64} className="mb-4 opacity-90" />
                    <h2 className="text-3xl font-bold">Service Disruption</h2>
                    <p className="mt-2 opacity-90">{downMonitors.length} service(s) currently experiencing issues.</p>
                </>
            )}
        </div>

        {/* 2. MONITOR LIST */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">System Metrics</h3>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Uptime (Last 60 checks)</span>
            </div>

            <div className="divide-y divide-gray-100">
                {statusPage.monitors.map((monitor) => (
                    <div key={monitor.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        
                        {/* Monitor Info */}
                        <div className="flex items-center gap-4 min-w-[200px]">
                            {monitor.status === "UP" ? (
                                <CheckCircle className="text-green-500 shrink-0" size={20} />
                            ) : (
                                <XCircle className="text-red-500 shrink-0" size={20} />
                            )}
                            <div>
                                <div className="font-bold text-gray-900">{monitor.name || monitor.url}</div>
                                {monitor.status === "DOWN" && (
                                    <span className="text-xs text-red-600 font-semibold">Currently Down</span>
                                )}
                            </div>
                        </div>

                        {/* Uptime History Bar (The "Pills") */}
                        <div className="flex items-center gap-1">
                            {/* We reverse the array so the newest checks are on the RIGHT */}
                            {monitor.checks.slice().reverse().map((check, i) => (
                                <div 
                                    key={check.id}
                                    title={`Status: ${check.statusCode} | Latency: ${check.latency}ms`}
                                    className={`w-1.5 h-6 rounded-sm ${
                                        check.statusCode >= 400 
                                            ? "bg-red-500" // Down
                                            : check.latency > 1000 
                                                ? "bg-yellow-400" // Slow
                                                : "bg-green-400" // Healthy
                                    }`}
                                ></div>
                            ))}
                            {/* Fill empty spots if not enough history yet */}
                            {Array.from({ length: Math.max(0, 60 - monitor.checks.length) }).map((_, i) => (
                                <div key={i} className="w-1.5 h-6 rounded-sm bg-gray-100"></div>
                            ))}
                        </div>
                        
                        {/* Current Stats */}
                        <div className="text-right text-sm text-gray-500 w-24 hidden sm:block">
                            {monitor.status === "UP" ? (
                                <span className="text-green-600 font-medium">100%</span>
                            ) : (
                                <span className="text-red-600 font-medium">Outage</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </main>

      <footer className="py-8 text-center text-sm text-gray-400">
        Powered by <Link href="/" className="underline hover:text-gray-600">Sentinel</Link>
      </footer>
    </div>
  );
}