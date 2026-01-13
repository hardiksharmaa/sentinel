"use client";

import { useState } from "react";
import { RefreshCw, Trash2, Globe, Calendar, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { refreshSSLMonitor, deleteSSLMonitor } from "./actions";

export default function SSLCard({ monitor }: { monitor: any }) {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    await refreshSSLMonitor(monitor.id, monitor.domain);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (confirm("Stop monitoring SSL for this domain?")) {
        await deleteSSLMonitor(monitor.id);
    }
  };

  const isHealthy = monitor.status === "HEALTHY";
  const isExpiring = monitor.status === "EXPIRING";
  const isExpired = monitor.status === "EXPIRED";
  const isError = monitor.status === "ERROR";

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group">
      <div className="flex justify-between items-start mb-4">
        
        {/* Left: Domain & Status Icon */}
        <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full shrink-0 ${
                isHealthy ? "bg-green-100 text-green-600" :
                isExpiring ? "bg-yellow-100 text-yellow-600" :
                "bg-red-100 text-red-600"
            }`}>
                {isHealthy && <CheckCircle size={24} />}
                {isExpiring && <AlertTriangle size={24} />}
                {(isExpired || isError) && <XCircle size={24} />}
            </div>
            <div>
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    {monitor.domain}
                    <a href={`https://${monitor.domain}`} target="_blank" className="text-gray-400 hover:text-blue-500"><Globe size={14}/></a>
                </h3>
                <p className="text-sm text-gray-500">Issued by: {monitor.issuer || "Unknown"}</p>
            </div>
        </div>

        {/* Right: Days Counter */}
        <div className="text-right">
            {isError ? (
                 <span className="text-red-600 font-bold">Connection Failed</span>
            ) : (
                <>
                    <div className={`text-2xl font-bold ${
                        isHealthy ? "text-gray-900" : "text-red-600"
                    }`}>
                        {monitor.daysRemaining}
                    </div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Days Left</div>
                </>
            )}
        </div>
      </div>

      {/* Footer: Date & Actions */}
      <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar size={12} />
            Expires: {monitor.validTo ? new Date(monitor.validTo).toLocaleDateString() : "N/A"}
        </div>

        <div className="flex gap-2">
             <button 
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Refresh Certificate"
             >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
             </button>
             <button 
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete Monitor"
             >
                <Trash2 size={16} />
             </button>
        </div>
      </div>
    </div>
  );
}