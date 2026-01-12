import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Activity, Zap, Shield, ArrowRight, BarChart3, CheckCircle2 } from "lucide-react";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      
      {/* 1. Navbar */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600">
            <Activity size={24} />
            Sentinel
          </div>
          <div>
            {session ? (
              <Link 
                href="/dashboard"
                className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                href="/api/auth/signin" 
                className="text-sm font-medium text-gray-600 hover:text-black transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
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
              href={session ? "/dashboard" : "/api/auth/signin"}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              Start Monitoring Free <ArrowRight size={18} />
            </Link>
            <a 
              href="#features" 
              className="w-full sm:w-auto px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
            >
              How it works
            </a>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-50 to-transparent rounded-full blur-3xl -z-10 opacity-60"></div>
      </section>

      {/* 3. Features Grid */}
      <section id="features" className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to stay online</h2>
            <p className="text-gray-500">Simple, powerful, and effective monitoring tools.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Checks</h3>
              <p className="text-gray-500 leading-relaxed">
                We ping your website every 5 minutes from our global network to ensure it's accessible to everyone.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Alerts</h3>
              <p className="text-gray-500 leading-relaxed">
                Receive an email the second your site goes down. We filter out false positives so you only get alerted when it matters.
              </p>
            </div>

            {/* Feature 3 */}
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

      {/* 4. Social Proof / Stats */}
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

      {/* 5. Footer */}
      <footer className="py-10 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="flex items-center gap-2 font-semibold text-gray-900 mb-4 md:mb-0">
                <Activity size={16} /> Sentinel
            </div>
            <div className="flex gap-6">
                <a href="#" className="hover:text-black">Privacy</a>
                <a href="#" className="hover:text-black">Terms</a>
                <a href="#" className="hover:text-black">GitHub</a>
            </div>
            <div className="mt-4 md:mt-0">
                © {new Date().getFullYear()} Sentinel Inc.
            </div>
        </div>
      </footer>
    </div>
  );
}