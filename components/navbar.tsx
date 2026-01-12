"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Menu, X } from "lucide-react";
import { useState } from "react";
import UserDropdown from "@/app/dashboard/user-dropdown"; 

interface NavbarProps {
  user?: any; // We pass the user if logged in
}

export default function Navbar({ user }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Pricing", href: "/pricing" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* 1. Logo */}
        <Link href={user ? "/" : "/"} className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 hover:opacity-80 transition">
          <Activity size={24} />
          Sentinel
        </Link>

        {/* 2. Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          
          {/* Dashboard Link (Only if logged in) - Added here at the left */}
          {user && (
             <Link 
                href="/dashboard" 
                className={`text-sm font-medium transition-colors ${
                  pathname === "/dashboard" ? "text-blue-600 font-bold" : "text-gray-600 hover:text-black"
                }`}
             >
               Dashboard
             </Link>
          )}

          {/* Standard Links (Pricing, Contact) */}
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className={`text-sm font-medium transition-colors ${
                pathname === link.href ? "text-blue-600 font-bold" : "text-gray-600 hover:text-black"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Settings Link (Only if logged in) */}
          {user && (
             <Link 
                href="/dashboard/settings" 
                className={`text-sm font-medium transition-colors ${
                  pathname.includes("/settings") ? "text-blue-600 font-bold" : "text-gray-600 hover:text-black"
                }`}
             >
               Settings
             </Link>
          )}
        </div>

        {/* 3. Auth Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <UserDropdown user={user} />
          ) : (
            <Link 
              href="/login" 
              className="text-sm font-medium text-white bg-gray-900 px-4 py-2 rounded-full hover:bg-gray-800 transition shadow-md hover:shadow-lg"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* 4. Mobile Menu Button */}
        <button className="md:hidden p-2 text-gray-600" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-xl">
           
           {/* Mobile Dashboard Link */}
           {user && (
             <Link 
                href="/dashboard"
                onClick={() => setIsOpen(false)} 
                className="block text-base font-medium text-gray-700 hover:text-blue-600"
             >
               Dashboard
             </Link>
           )}

           {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block text-base font-medium text-gray-700 hover:text-blue-600"
            >
              {link.name}
            </Link>
           ))}

           {user && (
             <Link 
                href="/dashboard/settings"
                onClick={() => setIsOpen(false)} 
                className="block text-base font-medium text-gray-700 hover:text-blue-600"
             >
               Settings
             </Link>
           )}
           <div className="pt-4 border-t border-gray-100">
             {user ? (
               <div className="flex justify-center"><UserDropdown user={user} /></div>
             ) : (
               <Link href="/login" className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-bold">
                 Sign In
               </Link>
             )}
           </div>
        </div>
      )}
    </nav>
  );
}