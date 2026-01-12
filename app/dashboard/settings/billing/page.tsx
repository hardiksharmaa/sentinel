import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Check, Zap, CreditCard } from "lucide-react";
import SubscriptionButton from "./subscription-button";

export const dynamic = "force-dynamic"; // <--- Add this to force fresh data

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
      where: { id: session.user.id }
  });

  const monitorCount = await prisma.monitor.count({
    where: { userId: session.user.id }
  });

  // Check if PRO is active (Price ID exists AND period hasn't expired)
  const isPro = !!user?.stripePriceId && (user.stripeCurrentPeriodEnd?.getTime() ?? 0) > Date.now();
  
  const LIMIT = isPro ? 100 : 10;
  const usagePercent = Math.min((monitorCount / LIMIT) * 100, 100);

  return (
    <div className="space-y-8">
      
      {/* 1. Usage Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Current Usage</h2>
            <p className="text-sm text-gray-500">Your resource consumption.</p>
          </div>
          <div className={`${isPro ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide`}>
            {isPro ? "Pro Plan" : "Free Plan"}
          </div>
        </div>
        
        <div className="p-6">
            <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-gray-700">Monitors</span>
                <span className="text-sm text-gray-500">{monitorCount} / {isPro ? "∞" : LIMIT} used</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                <div 
                    className={`h-2.5 rounded-full ${usagePercent >= 100 ? 'bg-red-500' : 'bg-blue-600'}`} 
                    style={{ width: `${usagePercent}%` }}
                ></div>
            </div>
        </div>
      </div>

      {/* 2. Plans Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* FREE PLAN CARD */}
        <div className={`border-2 ${!isPro ? "border-blue-100 bg-blue-50/20" : "border-transparent bg-white shadow-sm border-gray-100"} rounded-xl p-6 relative transition-all`}>
            {!isPro && <div className="absolute top-0 right-0 bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">CURRENT</div>}
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">Free</h3>
            <div className="text-3xl font-extrabold text-gray-900 mb-6">$0 <span className="text-sm font-normal text-gray-500">/month</span></div>

            <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-blue-600" /> 10 Monitors
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-blue-600" /> 5-minute Check Interval
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-blue-600" /> Email Alerts
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-400">
                    <Check size={16} /> SMS Alerts
                </li>
            </ul>

            <button disabled className="w-full py-2.5 border border-gray-200 text-gray-400 font-medium rounded-lg text-sm bg-gray-50 cursor-not-allowed">
                {isPro ? "Downgrade (via Portal)" : "Your Current Plan"}
            </button>
        </div>

        {/* PRO PLAN CARD */}
        <div className={`border-2 ${isPro ? "border-purple-100 bg-purple-50/20" : "border-gray-200 bg-white"} rounded-xl p-6 relative group overflow-hidden`}>
            {isPro && <div className="absolute top-0 right-0 bg-purple-100 text-purple-600 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">CURRENT</div>}
            
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                Pro <Zap size={16} className="text-purple-500 fill-purple-500" />
            </h3>
            <div className="text-3xl font-extrabold text-gray-900 mb-6">$19 <span className="text-sm font-normal text-gray-500">/month</span></div>

            <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-500" /> <strong>Unlimited</strong> Monitors
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-500" /> <strong>1-minute</strong> Check Interval
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-500" /> Priority Email Alerts
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-500" /> SMS Alerts (Included)
                </li>
            </ul>
            
            <SubscriptionButton isPro={isPro} /> 
        </div>
      </div>
    </div>
  );
}