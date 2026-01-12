import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Shield, Lock } from "lucide-react";

export default async function SecurityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-base font-semibold text-gray-900">Security Settings</h2>
          <p className="text-sm text-gray-500">Manage your password and authentication preferences.</p>
        </div>

        <div className="p-6 space-y-8">
            
            {/* 1. Sign-in Method */}
            <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Sign-in Method</h3>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                        {/* Google Icon SVG */}
                        <div className="bg-white p-2 rounded-full border border-gray-200 shadow-sm">
                             <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Google Account</p>
                            <p className="text-xs text-gray-500">You log in securely via Google.</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                        <Shield size={12} />
                        Active
                    </span>
                </div>
            </div>

            <div className="h-px bg-gray-100"></div>

            {/* 2. Password Change (Disabled State) */}
            <div>
                 <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>
                 
                 {/* Helpful Explanation Box */}
                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex gap-3">
                        <Lock className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-yellow-800">Password management is disabled</p>
                            <p className="text-sm text-yellow-700 mt-1 leading-relaxed">
                                Because you signed in with Google, you don't have a specific password for this app. 
                                To change your password, please visit your <a href="https://myaccount.google.com/security" target="_blank" className="underline hover:text-yellow-900 font-medium">Google Account Settings</a>.
                            </p>
                        </div>
                    </div>
                 </div>

                 {/* Visual-only disabled form */}
                 <div className="grid gap-4 opacity-40 select-none pointer-events-none grayscale-[0.5]">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Current Password</label>
                        <div className="relative">
                            <input type="password" disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" value="••••••••" />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">New Password</label>
                            <input type="password" disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" placeholder="New password" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                            <input type="password" disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" placeholder="Confirm password" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button disabled className="bg-gray-200 text-gray-400 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                            Update Password
                        </button>
                    </div>
                 </div>
            </div>

        </div>
      </div>
    </div>
  );
}