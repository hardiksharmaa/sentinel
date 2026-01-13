"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom"; // <--- IMPORT THIS
import { signOut } from "next-auth/react";
import { LogOut, Settings, CreditCard, ChevronDown, Sparkles, Edit2, Upload, X, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { updateProfileImage } from "./actions";

interface UserDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    stripePriceId?: string | null;
    stripeCurrentPeriodEnd?: Date | null;
  };
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isPro = !!user.stripePriceId && (new Date(user.stripeCurrentPeriodEnd ?? 0).getTime() > Date.now());

  const avatarSrc = (user.image && !imageError) 
    ? user.image 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=random`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-blue-100"
      >
        <img 
          src={avatarSrc} 
          alt="Avatar" 
          onError={() => setImageError(true)} 
          className="w-8 h-8 rounded-full border border-gray-200 object-cover"
        />
        <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-700 leading-none">{user.name}</p>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
             <div className="relative group">
                <img 
                    src={avatarSrc} 
                    alt="Avatar" 
                    onError={() => setImageError(true)}
                    className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                />
                <button 
                    onClick={() => {
                        setIsOpen(false);
                        setIsModalOpen(true);
                    }}
                    className="absolute -bottom-1 -right-1 bg-white border border-gray-200 text-gray-600 p-1 rounded-full shadow-sm hover:text-blue-600 hover:border-blue-600 transition z-10"
                    title="Change Photo"
                >
                    <Edit2 size={10} />
                </button>
             </div>

             <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
             </div>
          </div>

          <div className="p-2">
            <div className={`rounded-lg p-3 mb-2 ${isPro ? "bg-purple-50 border border-purple-100" : "bg-gray-50"}`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Plan</span>
                    {isPro ? (
                       <span className="bg-purple-600 text-white py-0.5 px-2 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <Sparkles size={10} /> PRO
                       </span>
                    ) : (
                       <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-[10px] font-bold">FREE</span>
                    )}
                </div>
                
                {!isPro && (
                    <Link 
                        href="/dashboard/settings/billing"
                        onClick={() => setIsOpen(false)}
                        className="w-full bg-gray-900 hover:bg-black text-white text-xs font-medium py-2 rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                        <CreditCard size={14} />
                        Upgrade to Premium
                    </Link>
                )}
                
                {isPro && (
                    <Link
                        href="/dashboard/settings/billing"
                        onClick={() => setIsOpen(false)}
                        className="w-full bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-medium py-2 rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                        <Settings size={14} />
                        Manage Subscription
                    </Link>
                )}
            </div>
          </div>

          <div className="h-px bg-gray-100 my-1 mx-2"></div>

          <div className="px-2">
            <Link 
                href="/dashboard/settings" 
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
            >
                <Settings size={16} />
                Settings
            </Link>
            
            <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors text-left"
            >
                <LogOut size={16} />
                Log out
            </button>
          </div>
        </div>
      )}

      {/* Render Modal */}
      {isModalOpen && (
        <ProfilePhotoModal 
            user={user} 
            close={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENT: Portal Modal ---
function ProfilePhotoModal({ user, close }: { user: any, close: () => void }) {
    const [preview, setPreview] = useState(user.image);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false); // To handle hydration
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Ensure we only run Portal logic on the client
    useEffect(() => {
        setMounted(true);
        // Lock body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 400;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                setPreview(compressedBase64); 
            };
        };
    };

    const handleSave = async () => {
        setLoading(true);
        await updateProfileImage(preview);
        setLoading(false);
        close();
        window.location.reload(); 
    };

    const handleDelete = () => {
        if(confirm("Remove profile photo?")) {
            setPreview(null);
        }
    };

    // If not mounted yet (SSR), return nothing
    if (!mounted) return null;

    // 2. USE PORTAL: Render this div directly into document.body
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Content */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 text-sm">Edit Profile Photo</h3>
                    <button onClick={close} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-md hover:bg-gray-100">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col items-center space-y-5">
                    <div className="relative group">
                        <img 
                            src={preview || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                            alt="Preview" 
                            className="w-28 h-28 rounded-full object-cover border-4 border-gray-50 shadow-inner"
                        />
                    </div>

                    <div className="flex gap-2 w-full">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white text-sm h-9 px-4 rounded-md font-medium hover:bg-blue-700 transition shadow-sm"
                        >
                            <Upload size={14} /> Upload New
                        </button>
                        
                        {preview && (
                             <button 
                                onClick={handleDelete}
                                className="h-9 w-9 flex items-center justify-center bg-white border border-gray-200 text-red-600 rounded-md hover:bg-red-50 hover:border-red-200 transition shadow-sm"
                                title="Remove Photo"
                             >
                                <Trash2 size={16} />
                             </button>
                        )}
                    </div>

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileSelect} 
                    />
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-gray-50 flex justify-end gap-2 border-t border-gray-100">
                    <button 
                        onClick={close} 
                        className="text-gray-700 text-sm font-medium h-9 px-3 rounded-md hover:bg-gray-200/50 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="bg-gray-900 text-white text-sm h-9 px-4 rounded-md font-medium hover:bg-black transition disabled:opacity-70 flex items-center gap-2 shadow-sm"
                    >
                        {loading && <Loader2 className="animate-spin" size={14} />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>,
        document.body // Target container
    );
}