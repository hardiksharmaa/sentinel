import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import CreatePageModal from "./create-modal";
import DeleteButton from "./delete-button";
import Navbar from "@/components/navbar";
import { getCachedData, DB_CACHE_TTL, getCachedUser } from "@/lib/redis"; 

export default async function StatusPagesDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await getCachedUser(session.user.id);

  if (!user) redirect("/login");

  const statusPagesKey = `dashboard:status-pages:${session.user.id}`;
  
  const statusPages = await getCachedData(
    statusPagesKey,
    async () => {
      return await prisma.statusPage.findMany({
        where: { userId: session.user.id },
        include: { _count: { select: { monitors: true } } }
      });
    },
    DB_CACHE_TTL
  );


  const simpleMonitorsKey = `dashboard:monitors_simple:${session.user.id}`;

  const monitors = await getCachedData(
    simpleMonitorsKey,
    async () => {
      return await prisma.monitor.findMany({
        where: { userId: session.user.id }
      });
    },
    DB_CACHE_TTL
  );
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      <Navbar user={user} />

      <main className="max-w-5xl mx-auto mt-10 px-6">
        
        <div className="mb-8 border-b border-gray-200">
            <div className="flex gap-8">
                <Link 
                    href="/dashboard" 
                    className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm transition"
                >
                    Monitors
                </Link>
                
                <Link 
                    href="/dashboard/status-pages" 
                    className="pb-3 border-b-2 border-blue-600 text-blue-600 font-medium text-sm"
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Status Pages</h1>
            <p className="text-gray-500 mt-1">Create public pages to show off your uptime.</p>
          </div>
          <CreatePageModal monitors={monitors} />
        </div>

        {statusPages.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
             <h3 className="text-lg font-medium text-gray-900">No status pages yet</h3>
             <p className="text-gray-500 mb-6">Create your first public status page today.</p>
           </div>
        ) : (
          <div className="grid gap-4">
            {statusPages.map((page) => (
              <div key={page.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center hover:shadow-md transition">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{page.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {page._count.monitors} Monitors
                    </span>
                    <Link href={`/status/${page.slug}`} target="_blank" className="hover:text-blue-600 flex items-center gap-1">
                      /status/{page.slug} <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
                <DeleteButton id={page.id} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}