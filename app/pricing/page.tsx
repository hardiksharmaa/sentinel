import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/navbar"; // Use the new navbar
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Check, Zap } from "lucide-react";

export default async function PricingPage() {
  const session = await getServerSession(authOptions);
  
  // Fetch user if logged in (for the navbar)
  const user = session?.user?.id 
    ? await prisma.user.findUnique({ where: { id: session.user.id } }) 
    : null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />
      
      <div className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Simple, transparent pricing
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Start for free, upgrade when you need more power. No hidden fees.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* FREE PLAN */}
            <div className="p-8 rounded-2xl border border-gray-200 hover:border-blue-200 transition-colors bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transform duration-300">
                <h3 className="text-xl font-bold text-gray-900">Starter</h3>
                <div className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-5xl font-extrabold tracking-tight">$0</span>
                    <span className="ml-1 text-xl font-semibold text-gray-500">/month</span>
                </div>
                <p className="mt-2 text-gray-500">Perfect for side projects.</p>

                <ul className="mt-8 space-y-4">
                    {["10 Monitors", "5-minute check interval", "Email Alerts", "7-day Data Retention"].map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                            <div className="bg-blue-100 rounded-full p-1"><Check size={14} className="text-blue-600" /></div>
                            <span className="text-gray-700 font-medium">{feature}</span>
                        </li>
                    ))}
                </ul>

                <Link 
                    href={user ? "/dashboard" : "/login"}
                    className="mt-8 block w-full py-3 px-6 border border-gray-200 rounded-xl text-center font-bold text-gray-700 hover:bg-gray-50 hover:text-black transition"
                >
                    {user ? "Go to Dashboard" : "Get Started Free"}
                </Link>
            </div>

            {/* PRO PLAN */}
            <div className="relative p-8 rounded-2xl border border-gray-200 bg-gray-900 text-white shadow-2xl hover:-translate-y-1 transform duration-300">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                    POPULAR
                </div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                    Pro <Zap size={20} className="fill-yellow-400 text-yellow-400" />
                </h3>
                <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-extrabold tracking-tight">$19</span>
                    <span className="ml-1 text-xl font-semibold text-gray-400">/month</span>
                </div>
                <p className="mt-2 text-gray-400">For serious businesses.</p>

                <ul className="mt-8 space-y-4">
                    {["Unlimited Monitors", "1-minute check interval", "SMS & Email Alerts", "365-day Data Retention", "Priority Support"].map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                            <div className="bg-blue-600/30 rounded-full p-1"><Check size={14} className="text-blue-400" /></div>
                            <span className="text-gray-200 font-medium">{feature}</span>
                        </li>
                    ))}
                </ul>

                <Link 
                    href={user ? "/dashboard/settings/billing" : "/login?redirect=/dashboard/settings/billing"}
                    className="mt-8 block w-full py-3 px-6 bg-blue-600 rounded-xl text-center font-bold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-900/50"
                >
                    {user ? "Upgrade to Pro" : "Get Started with Pro"}
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}