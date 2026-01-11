import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MonitorActions from "./monitor-actions";

export default async function MonitorDetails({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  const { id } = await params;
  // 1. Fetch the Monitor with its Check History
  const monitor = await prisma.monitor.findFirst({
    where: { 
      id: id, 
      userId: session.user.id 
    },
    include: {
      checks: {
        orderBy: { createdAt: "desc" },
        take: 20, 
      }
    }
  });

  if (!monitor) {
    return notFound(); // Show 404 if not found
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link href="/dashboard" className="flex items-center text-sm text-gray-500 hover:text-black mb-6 transition">
          <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
        </Link>

        {/* Header Section */}
        <div className="bg-white p-6 rounded-lg border shadow-sm mb-6 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold">{monitor.name}</h1>
                <a href={monitor.url} target="_blank" className="text-blue-500 hover:underline">{monitor.url}</a>
            </div>
            
            <div className="flex items-center gap-3">
                {/* Status Badge */}
                <div className={`px-4 py-2 rounded-md font-bold text-white ${monitor.status === 'UP' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {monitor.status}
                </div>
                
                {/* The New Buttons */}
                <MonitorActions id={monitor.id} url={monitor.url} />
            </div>
        </div>

        {/* History Log */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 font-medium">Recent Checks</div>
            {monitor.checks.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No checks performed yet.</div>
            ) : (
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Latency</th>
                            <th className="px-4 py-2">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monitor.checks.map((check) => (
                            <tr key={check.id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${check.statusCode >= 400 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {check.statusCode}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-mono">{check.latency}ms</td>
                                <td className="px-4 py-3 text-gray-500">
                                    {new Date(check.createdAt).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </div>
  );
}