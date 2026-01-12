"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { sendContactEmail } from "@/app/contact/actions";
import { Loader2, Send } from "lucide-react";

export default function ContactForm() {
  const [isSending, setIsSending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setIsSending(true);

    const result = await sendContactEmail(formData);

    setIsSending(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Message sent successfully!");
      formRef.current?.reset(); // <--- This clears the fields
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <input name="firstName" required className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" placeholder="xyz" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <input name="lastName" required className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" placeholder="xyz" />
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input name="email" type="email" required className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" placeholder="xyz@example.com" />
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Message</label>
            <textarea name="message" rows={4} required className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" placeholder="How can we help?" />
        </div>

        <button 
            type="submit" 
            disabled={isSending}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isSending ? (
                <>
                    <Loader2 className="animate-spin" size={20} /> Sending...
                </>
            ) : (
                <>
                    Send Message <Send size={18} />
                </>
            )}
        </button>
    </form>
  );
}