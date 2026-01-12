"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, Settings } from "lucide-react";

interface SubscriptionButtonProps {
  isPro: boolean;
}

export default function SubscriptionButton({ isPro }: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    try {
      setLoading(true);
      
      // Determine which API to call
      const endpoint = isPro ? "/api/stripe/portal" : "/api/stripe/checkout";
      
      const response = await fetch(endpoint, { method: "POST" });
      const data = await response.json();
      
      // Redirect user
      window.location.href = data.url;
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
        onClick={handleAction} 
        disabled={loading}
        className={`w-full py-2.5 font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm
            ${isPro 
                ? "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50" 
                : "bg-gray-900 hover:bg-black text-white shadow-lg shadow-gray-200"
            }`}
    >
      {loading ? "Processing..." : isPro ? (
          <>
            <Settings size={16} />
            Manage Subscription
          </>
      ) : (
          <>
            <CreditCard size={16} />
            Upgrade to Pro
          </>
      )}
    </button>
  );
}