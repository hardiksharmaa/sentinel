"use client";

import Link from "next/link";
import {
  Zap,
  Bell,
  ArrowRight,
  BarChart3,
  X,
  Activity,
  Lock,
  Globe,
} from "lucide-react";
import { useState } from "react";
import { Session } from "next-auth";
import { motion } from "framer-motion";

import ParallaxCard from "./ParallaxCard";
import EarthCanvas from "./EarthCanvas";


export default function LandingClient({ session }: { session: Session | null }) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const scrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-white text-gray-900 font-sans selection:bg-blue-100 overflow-x-hidden">

      {/* ================= HERO ================= */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-20 -right-40 w-[400px] h-[400px] bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-6 border border-blue-100 uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              Live Monitoring
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
              Downtime costs money.
              <br />
              <span className="text-blue-600">We tell you first.</span>
            </h1>

            <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Monitor your websites, SSL certificates, and APIs 24/7. Get instant alerts and showcase your uptime with public status pages.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={session ? "/dashboard" : "/login"}
                  className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
                >
                  Start Monitoring Free <ArrowRight size={18} />
                </Link>
              </motion.div>

              <a
                href="#features"
                onClick={scrollToFeatures}
                className="px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
              >
                How it works
              </a>
            </div>
          </motion.div>

          <div className="hidden lg:block h-[420px]">
  <EarthCanvas />
</div>

        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="py-28 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Everything you need to stay online
            </h2>
            <p className="text-gray-500">
              Simple, powerful, and effective monitoring tools.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{ show: { transition: { staggerChildren: 0.15 } } }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {[
              { icon: Zap, title: "Real-time Checks", color: "blue", text: "We ping your website every 5 minutes from our global network to ensure it's accessible to everyone." },
              { icon: Bell, title: "Instant Alerts", color: "red", text: "Receive an email the second your site goes down. You only get alerted when it matters." },
              { icon: BarChart3, title: "Latency Analytics", color: "purple", text: "Visualize your response times with beautiful charts. Spot slow-loading pages before they affect your SEO." },
              { icon: Lock, title: "SSL Monitoring", color: "green", text: "Never let your certificate expire. We track your SSL validity and alert you 7 days before it expires." },
              { icon: Globe, title: "Public Status Pages", color: "orange", text: "Build trust with your customers. Create a beautiful status page to showcase your uptime history." },
              { icon: Activity, title: "Reliable History", color: "gray", text: "Keep a permanent record of your incidents and response times to help your team improve reliability." },
            ].map((f, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <ParallaxCard>
                  <div className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl border border-white/40 shadow-xl hover:shadow-2xl transition">
                    <div
                      className={`
                        w-14 h-14 rounded-xl flex items-center justify-center mb-6
                        ${f.title === "Public Status Pages"
                          ? "bg-orange-100 text-orange-600 shadow-sm"
                          : `bg-${f.color}-100 text-${f.color}-600`}
                      `}
                    >
                      <f.icon size={26} strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{f.text}</p>
                  </div>
                </ParallaxCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-10 bg-gray-50 border-t border-gray-200"
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-2 font-semibold text-gray-900 mb-4 md:mb-0">
            <Activity size={16} /> Sentinel
          </div>

          <div className="flex gap-6">
            <button onClick={() => setShowPrivacy(true)} className="hover:text-black transition">
              Privacy
            </button>
            <button onClick={() => setShowTerms(true)} className="hover:text-black transition">
              Terms
            </button>
            <a
              href="https://github.com/hardiksharmaa"
              target="_blank"
              rel="noreferrer"
              className="hover:text-black transition flex items-center gap-1"
            >
              GitHub <ArrowRight size={10} className="-rotate-45" />
            </a>
          </div>

          <div className="mt-4 md:mt-0">
            © {new Date().getFullYear()} Sentinel Inc.
          </div>
        </div>
      </motion.footer>

      {/* ================= MODALS (UNCHANGED) ================= */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative shadow-2xl">
            <button onClick={() => setShowPrivacy(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <p>At Sentinel, we take your privacy seriously...</p>
            </div>
          </div>
        </div>
      )}

      {showTerms && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative shadow-2xl">
            <button onClick={() => setShowTerms(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Terms of Service</h2>
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <p>By accessing Sentinel, you agree...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
