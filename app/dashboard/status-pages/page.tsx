import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import CreatePageModal from "./create-modal";
import DeleteButton from "./delete-button";
import Navbar from "@/components/navbar"; // <--- Use the shared Navbar

export default async function StatusPagesDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // 1. Fetch User Data (Required for Navbar)
  const user = await prisma.user.findUnique({ 
    where: { id: session.user.id } 
  });

  if (!user) redirect("/login");

  // 2. Fetch User's Status Pages
  const statusPages = await prisma.statusPage.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { monitors: true } } }
  });

  // 3. Fetch Monitors (for the Create Modal)
  const monitors = await prisma.monitor.findMany({
    where: { userId: session.user.id }
  });
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. GLOBAL NAVBAR (Consistent with Dashboard) */}
      <Navbar user={user} />

      <main className="max-w-5xl mx-auto mt-10 px-6">
        
        {/* 2. NAVIGATION TABS (Fixed Position) */}
        <div className="mb-8 border-b border-gray-200">
            <div className="flex gap-8">
                {/* Monitors Tab (Inactive) */}
                <Link 
                    href="/dashboard" 
                    className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm transition"
                >
                    Monitors
                </Link>
                
                {/* Status Pages Tab (Active - Blue Underline) */}
                <Link 
                    href="/dashboard/status-pages" 
                    className="pb-3 border-b-2 border-blue-600 text-blue-600 font-medium text-sm"
                >
                    Status Pages
                </Link>
            </div>
        </div>

        {/* 3. PAGE HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Status Pages</h1>
            <p className="text-gray-500 mt-1">Create public pages to show off your uptime.</p>
          </div>
          <CreatePageModal monitors={monitors} />
        </div>

        {/* 4. CONTENT LIST */}
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