"use client";

import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { LogOut, Settings, CreditCard, User, ChevronDown, Check } from "lucide-react";
import Link from "next/link";

interface UserDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicking outside
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
          src={user.image || `https://ui-avatars.com/api/?name=${user.name}`} 
          alt="Avatar" 
          className="w-8 h-8 rounded-full border border-gray-200"
        />
        <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-700 leading-none">{user.name}</p>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          
          {/* Section 1: User Info */}
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          {/* Section 2: Plan Selection */}
          <div className="p-2">
            <div className="bg-gray-50 rounded-lg p-3 mb-2">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Plan</span>
                    <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-[10px] font-bold">FREE</span>
                </div>
                <button className="w-full bg-gray-900 hover:bg-black text-white text-xs font-medium py-2 rounded-md transition-colors flex items-center justify-center gap-2">
                    <CreditCard size={14} />
                    Upgrade to Premium
                </button>
            </div>
          </div>

          <div className="h-px bg-gray-100 my-1 mx-2"></div>

          {/* Section 3: Menu Items */}
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
    </div>
  );
}