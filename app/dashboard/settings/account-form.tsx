"use client";

import { updateProfile, deleteAccount } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Props passed from the Server Component
interface AccountFormProps {
  user: {
    name: string | null;
    email: string | null;
    createdAt: Date;
  };
}

export default function AccountForm({ user }: AccountFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Handle Profile Update
  async function handleUpdate(formData: FormData) {
    setIsSaving(true);
    
    // Call the server action
    const result = await updateProfile(formData);
    
    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Profile updated successfully!");
      router.refresh(); // Refresh to update the navbar name
    }
  }

  // Handle Account Deletion
  async function handleDelete() {
    const confirm = window.confirm("Are you sure you want to delete your account? This cannot be undone.");
    if (!confirm) return;

    const result = await deleteAccount();

    if (result.error) {
        toast.error(result.error);
    } else {
        toast.success("Account deleted. Goodbye!");
        router.push("/login"); // Redirect to login
    }
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Account Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-base font-semibold text-gray-900">Account Details</h2>
          <p className="text-sm text-gray-500">Update your public profile information.</p>
        </div>
        
        <div className="p-6">
          <form action={handleUpdate} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                  name="name"
                  defaultValue={user.name || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  placeholder="Your Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user.email || ""}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                />
                <p className="text-[11px] text-gray-400">Managed by Google Login</p>
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Account Created</label>
                <div className="text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer flex items-center gap-2"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 2. Danger Zone Card */}
      <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 bg-red-50/30">
          <h2 className="text-base font-semibold text-red-900">Delete Account</h2>
          <p className="text-sm text-red-600/80">Permanently remove your account and all data.</p>
        </div>
        
        <div className="p-6 flex items-center justify-between gap-4">
            <div className="text-sm text-gray-600 max-w-md">
                Once you delete your account, there is no going back. Please be certain.
            </div>
            
            <button 
                onClick={handleDelete}
                className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
                Delete Account
            </button>
        </div>
      </div>

    </div>
  );
}