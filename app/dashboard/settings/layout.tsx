import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, CreditCard, Lock, Activity, ArrowLeft } from "lucide-react";
import UserDropdown from "../user-dropdown"; 
import { prisma } from "@/lib/prisma";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // 2. FETCH FRESH USER DATA
  // We don't trust the session.user.name because it might be stale.
  const freshUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  // If user was deleted but session exists, kick them out
  if (!freshUser) redirect("/login");

  const menuItems = [
    { name: "Account Details", href: "/dashboard/settings", icon: User },
    { name: "Billing & Plans", href: "/dashboard/settings/billing", icon: CreditCard },
    { name: "Security", href: "/dashboard/settings/security", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 hover:opacity-80 transition">
            <Activity size={24} />
            Sentinel
        </Link>
        {/* 3. PASS THE FRESH USER HERE */}
        <UserDropdown user={freshUser} /> 
      </nav>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
            <Link 
                href="/dashboard" 
                className="p-2 -ml-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Back to Dashboard"
            >
                <ArrowLeft size={24} />
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 text-sm mt-1">Manage your account preferences and subscription.</p>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <item.icon size={18} className="text-gray-400" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </aside>

          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}