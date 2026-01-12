import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/navbar"; 
import { prisma } from "@/lib/prisma";
import { Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/contact-form"; // <--- Import the new component

export default async function ContactPage() {
  const session = await getServerSession(authOptions);
  
  const user = session?.user?.id 
    ? await prisma.user.findUnique({ where: { id: session.user.id } }) 
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="py-20 px-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">
            
            {/* Left Column: Info */}
            <div className="bg-gray-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
                    <p className="text-gray-400 mb-12 leading-relaxed">
                        Have questions about Sentinel? We&apos;re here to help. <br/>
                        Fill out the form or reach out directly.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <Mail className="text-blue-400" size={20} />
                            </div>
                            <span className="font-medium">hs489819@gmail.com</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <Phone className="text-blue-400" size={20} />
                            </div>
                            <span className="font-medium">+91 7889480969</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <MapPin className="text-blue-400" size={20} />
                            </div>
                            <span className="font-medium">India</span>
                        </div>
                    </div>
                </div>

                {/* Decorative Circle */}
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
            </div>

            {/* Right Column: Interactive Form */}
            <div className="p-12">
                <ContactForm /> {/* <--- The interactive form goes here */}
            </div>
        </div>
      </div>
    </div>
  );
}