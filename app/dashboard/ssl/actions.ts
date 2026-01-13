"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import tls from "tls"; // Node.js native TLS module

// --- HELPER: The Actual SSL Check Logic ---
async function getCertificateDetails(domain: string) {
  return new Promise<{
    validFrom: Date;
    validTo: Date;
    issuer: string;
    daysRemaining: number;
    error?: string;
  }>((resolve) => {
    const options = {
      host: domain,
      port: 443,
      servername: domain, // Required for SNI (most modern sites)
      rejectUnauthorized: false, // Connect even if expired (so we can read the date)
      timeout: 5000, // 5s timeout
    };

    const socket = tls.connect(options, () => {
      const cert = socket.getPeerCertificate();
      
      if (!cert || Object.keys(cert).length === 0) {
        resolve({ 
            validFrom: new Date(), 
            validTo: new Date(), 
            issuer: "Unknown", 
            daysRemaining: 0, 
            error: "No certificate found" 
        });
        socket.end();
        return;
      }

      const validFrom = new Date(cert.valid_from);
      const validTo = new Date(cert.valid_to);
      const issuer = (typeof cert.issuer === 'string') 
        ? cert.issuer 
        : (cert.issuer as any).O || (cert.issuer as any).CN || "Unknown";
      
      // Calculate Days Remaining
      const diffTime = validTo.getTime() - Date.now();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      resolve({
        validFrom,
        validTo,
        issuer,
        daysRemaining,
      });
      socket.end();
    });

    socket.on("error", (err) => {
      resolve({
          validFrom: new Date(),
          validTo: new Date(),
          issuer: "Error",
          daysRemaining: 0,
          error: "Connection Failed: " + err.message
      });
    });

    socket.on("timeout", () => {
        socket.destroy();
        resolve({
            validFrom: new Date(),
            validTo: new Date(),
            issuer: "Timeout",
            daysRemaining: 0,
            error: "Connection timed out"
        });
    });
  });
}

// --- ACTION 1: Add New SSL Monitor ---
export async function createSSLMonitor(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    let domain = formData.get("domain") as string;
    
    // Clean input: Remove https://, http://, and trailing slashes
    domain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "").trim();

    if (!domain) return { error: "Domain is required" };

    // 1. Run the initial check immediately
    const details = await getCertificateDetails(domain);

    // 2. Determine Status
    let status = "HEALTHY";
    if (details.error) status = "ERROR";
    else if (details.daysRemaining < 3) status = "EXPIRED"; // Critical
    else if (details.daysRemaining < 14) status = "EXPIRING"; // Warning

    // 3. Save to DB
    await prisma.sSLMonitor.create({
        data: {
            userId: session.user.id,
            domain: domain,
            issuer: details.issuer,
            validFrom: details.validFrom,
            validTo: details.validTo,
            daysRemaining: details.daysRemaining,
            status: status,
            error: details.error
        }
    });

    revalidatePath("/dashboard/ssl");
    return { success: true };
}

// --- ACTION 2: Manual Refresh ---
export async function refreshSSLMonitor(id: string, domain: string) {
    const details = await getCertificateDetails(domain);
    
    let status = "HEALTHY";
    if (details.error) status = "ERROR";
    else if (details.daysRemaining < 3) status = "EXPIRED";
    else if (details.daysRemaining < 14) status = "EXPIRING";

    await prisma.sSLMonitor.update({
        where: { id },
        data: {
            issuer: details.issuer,
            validFrom: details.validFrom,
            validTo: details.validTo,
            daysRemaining: details.daysRemaining,
            status: status,
            error: details.error,
            lastCheck: new Date()
        }
    });
    revalidatePath("/dashboard/ssl");
}

// --- ACTION 3: Delete ---
export async function deleteSSLMonitor(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    await prisma.sSLMonitor.delete({
        where: { id, userId: session.user.id }
    });
    revalidatePath("/dashboard/ssl");
}