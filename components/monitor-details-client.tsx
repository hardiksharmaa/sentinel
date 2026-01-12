"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Trash2, ArrowLeft, Clock, Activity, CheckCircle2, Wifi, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { triggerCheck, deleteMonitor } from "@/app/dashboard/actions"; 
import Link from "next/link";

// Interfaces
interface Check {
  id: string;
  createdAt: Date;
  latency: number;
  statusCode: number;
}

interface Monitor {
  id: string;
  name: string | null;
  url: string;
  status: string;
  checks: Check[];
}

export default function MonitorDetailsClient({ monitor }: { monitor: Monitor }) {
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // --- ACTIONS ---
  const handleCheck = async () => {
    setLoading(true);
    await triggerCheck(monitor.id, monitor.url);
    setLoading(false);
    toast.success("Check run successfully");
    router.refresh();
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this monitor?")) {
        setIsDeleting(true);
        await deleteMonitor(monitor.id);
        toast.success("Monitor deleted");
        router.push("/dashboard");
    }
  };

  // --- STATS ---
  const checks = monitor.checks || [];
  const totalChecks = checks.length;
  
  const avgLatency = totalChecks > 0 
    ? Math.round(checks.reduce((acc, c) => acc + c.latency, 0) / totalChecks) 
    : 0;

  const successCount = checks.filter(c => c.statusCode >= 200 && c.statusCode < 300).length;
  const uptime = totalChecks > 0 ? Math.round((successCount / totalChecks) * 100) : 100;

  // --- GRAPH DATA ---
  // We take the last 20 checks and reverse them so they flow Left -> Right (Oldest -> Newest)
  const graphData = [...checks].slice(0, 20).reverse();
  const maxLatency = Math.max(...graphData.map(c => c.latency), 50) * 1.5; // Ensure at least 50ms scale

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 -ml-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition">
                <ArrowLeft size={20} />
            </Link>
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">{monitor.name || "Untitled"}</h1>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                        monitor.status === "UP" 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                        {monitor.status}
                    </span>
                </div>
                <a href={monitor.url} target="_blank" className="text-sm text-gray-500 hover:underline hover:text-blue-600 transition-colors">
                    {monitor.url}
                </a>
            </div>
        </div>

        {/* BUTTONS */}
        <div className="flex items-center gap-2">
            <button 
                onClick={handleCheck}
                disabled={loading}
                className="h-9 px-3 text-xs font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} />}
                Run Check
            </button>
            <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-9 px-3 text-xs font-medium border border-red-100 bg-white hover:bg-red-50 text-red-600 rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
                <Trash2 size={14} />
                Delete
            </button>
        </div>
      </div>

      {/* 2. SPLIT LAYOUT (Graph + Stats) */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        
        {/* LEFT: GRAPH */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col h-64 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4 z-10">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Activity size={16} className="text-blue-500" /> Latency History
                </h3>
                <span className="text-xs text-gray-400">Last 20 checks</span>
            </div>

            <div className="flex-1 w-full h-full relative">
                {graphData.length > 1 ? (
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${graphData.length - 1} 100`}>
                        <defs>
                            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        {/* Area Fill */}
                        <path 
                            d={`M 0,100 ${graphData.map((d, i) => `L ${i},${100 - (d.latency / maxLatency) * 100}`).join(" ")} L ${graphData.length - 1},100 Z`}
                            fill="url(#gradient)"
                        />
                        {/* Stroke Line */}
                        <path 
                            d={`M 0,${100 - (graphData[0].latency / maxLatency) * 100} ${graphData.map((d, i) => `L ${i},${100 - (d.latency / maxLatency) * 100}`).join(" ")}`}
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                        />
                         {/* Interactive Dots */}
                         {graphData.map((d, i) => (
                            <g key={i} className="group/dot">
                                <circle 
                                    cx={i} 
                                    cy={100 - (d.latency / maxLatency) * 100} 
                                    r="1.5" 
                                    className="fill-blue-500 opacity-0 group-hover/dot:opacity-100 transition-opacity cursor-pointer stroke-white stroke-1" 
                                    vectorEffect="non-scaling-stroke"
                                />
                            </g>
                        ))}
                    </svg>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                        <Activity className="mb-2 opacity-20" size={32} />
                        Waiting for more data...
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT: STATS GRID */}
        <div className="grid grid-rows-2 gap-4 h-64">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Wifi size={14} /> <span className="text-xs font-semibold uppercase">Avg Latency</span>
                    </div>
                    <div>
                        <span className={`text-2xl font-bold ${avgLatency < 200 ? 'text-green-600' : 'text-yellow-600'}`}>{avgLatency}</span>
                        <span className="text-xs text-gray-400 ml-1">ms</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <CheckCircle2 size={14} /> <span className="text-xs font-semibold uppercase">Uptime</span>
                    </div>
                    <div>
                        <span className={`text-2xl font-bold ${uptime > 98 ? 'text-green-600' : 'text-red-500'}`}>{uptime}%</span>
                        <span className="text-xs text-gray-400 ml-1">last 24h</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between">
                <div>
                     <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2 mb-1">
                        <Clock size={14} /> Last Checked
                     </p>
                     <p className="text-sm font-medium text-gray-900">
                        {checks[0] ? new Date(checks[0].createdAt).toLocaleTimeString() : "Never"}
                     </p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Checks</p>
                    <p className="text-xl font-bold text-gray-900">{totalChecks}</p>
                </div>
            </div>
        </div>
      </div>

      {/* 3. HISTORY TABLE (Restored) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-900">Recent Activity Log</h3>
        </div>
        <div className="divide-y divide-gray-100">
            {checks.slice(0, 10).map((check) => (
                <div key={check.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${check.statusCode >= 200 && check.statusCode < 300 ? "bg-green-500" : "bg-red-500"}`}></div>
                        <span className="text-sm font-medium text-gray-700">
                            {check.statusCode >= 200 && check.statusCode < 300 ? "Operational" : "Error"}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            {check.statusCode}
                        </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="font-mono text-xs">{check.latency}ms</span>
                        <span>{new Date(check.createdAt).toLocaleString()}</span>
                    </div>
                </div>
            ))}
            {checks.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-gray-400">
                    No checks recorded yet. Click "Run Check" to start.
                </div>
            )}
        </div>
      </div>

    </div>
  );
}