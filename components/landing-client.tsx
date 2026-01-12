"use client";

import Link from "next/link";
import { Zap, Shield, ArrowRight, BarChart3, X, Activity } from "lucide-react";
import { useState } from "react";
import { Session } from "next-auth";

// Note: Session is passed down but mostly handled by the parent Navbar now
export default function LandingClient({ session }: { session: Session | null }) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Smooth Scroll to Features
  const scrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-white text-gray-900 font-sans selection:bg-blue-100">
      
      {/* 1. Hero Section (Nav is now external) */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-6 border border-blue-100 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Live Monitoring
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
            Downtime costs money. <br/>
            <span className="text-blue-600">We tell you first.</span>
          </h1>
          
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Monitor your websites, APIs, and servers 24/7. Get instant alerts via email when something breaks, so you can fix it before your customers notice.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href={session ? "/dashboard" : "/login"}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              Start Monitoring Free <ArrowRight size={18} />
            </Link>
            <a 
              href="#features" 
              onClick={scrollToFeatures}
              className="w-full sm:w-auto px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition cursor-pointer"
            >
              How it works
            </a>
          </div>
        </div>

        {/* Decorative Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-50 to-transparent rounded-full blur-3xl -z-10 opacity-60"></div>
      </section>

      {/* 2. Features Grid */}
      <section id="features" className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to stay online</h2>
            <p className="text-gray-500">Simple, powerful, and effective monitoring tools.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Checks</h3>
              <p className="text-gray-500 leading-relaxed">
                We ping your website every 5 minutes from our global network to ensure it's accessible to everyone.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Alerts</h3>
              <p className="text-gray-500 leading-relaxed">
                Receive an email the second your site goes down. We filter out false positives so you only get alerted when it matters.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Latency Analytics</h3>
              <p className="text-gray-500 leading-relaxed">
                Visualize your response times with beautiful charts. Spot slow-loading pages before they affect your SEO.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Social Proof */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold mb-8">Trusted by developers worldwide</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-extrabold text-blue-600">99.9%</span>
                    <span className="text-gray-500 text-sm mt-1">Uptime Goal</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-extrabold text-blue-600">5min</span>
                    <span className="text-gray-500 text-sm mt-1">Check Frequency</span>
                </div>
                 <div className="flex flex-col items-center">
                    <span className="text-4xl font-extrabold text-blue-600">Zero</span>
                    <span className="text-gray-500 text-sm mt-1">False Alarms</span>
                </div>
                 <div className="flex flex-col items-center">
                    <span className="text-4xl font-extrabold text-blue-600">24/7</span>
                    <span className="text-gray-500 text-sm mt-1">Monitoring</span>
                </div>
            </div>
        </div>
      </section>

      {/* 4. Footer with Modals */}
      <footer className="py-10 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="flex items-center gap-2 font-semibold text-gray-900 mb-4 md:mb-0">
                <Activity size={16} /> Sentinel
            </div>
            <div className="flex gap-6">
                <button onClick={() => setShowPrivacy(true)} className="hover:text-black transition">Privacy</button>
                <button onClick={() => setShowTerms(true)} className="hover:text-black transition">Terms</button>
                <a href="https://github.com/hardiksharmaa" target="_blank" rel="noreferrer" className="hover:text-black transition flex items-center gap-1">
                  GitHub <ArrowRight size={10} className="-rotate-45" />
                </a>
            </div>
            <div className="mt-4 md:mt-0">
                © {new Date().getFullYear()} Sentinel Inc.
            </div>
        </div>
      </footer>

      {/* MODALS */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative shadow-2xl">
            <button onClick={() => setShowPrivacy(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
               <p>At Sentinel, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website.</p>
               <p><strong>1. Data Collection:</strong> We collect only the data necessary to provide our monitoring services, such as your email address and the URLs you wish to monitor.</p>
               <p><strong>2. Usage:</strong> Your data is used exclusively for sending you alerts and improving system performance. We do not sell your data to third parties.</p>
               <p><strong>3. Security:</strong> We use industry-standard encryption to protect your personal information and monitoring data.</p>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowPrivacy(false)} className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition">Close</button>
            </div>
          </div>
        </div>
      )}

      {showTerms && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative shadow-2xl">
            <button onClick={() => setShowTerms(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Terms of Service</h2>
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
               <p>By accessing Sentinel, you agree to be bound by these Terms of Service.</p>
               <p><strong>1. Usage License:</strong> Permission is granted to use Sentinel for personal or commercial monitoring of web services you own or manage.</p>
               <p><strong>2. Restrictions:</strong> You may not use the service for illegal purposes or to harass other web services (e.g., DDoS).</p>
               <p><strong>3. Disclaimer:</strong> The service is provided "as is". Sentinel makes no warranties regarding the reliability or accuracy of the monitoring data.</p>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowTerms(false)} className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition">I Agree</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}