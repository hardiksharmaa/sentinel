import { PrismaClient } from '@prisma/client';
import { SQSClient, SendMessageBatchCommand } from '@aws-sdk/client-sqs';
import * as tls from 'tls'; 

const prisma = new PrismaClient();
const sqs = new SQSClient({ region: "ap-south-1" });

async function getSSLDetails(hostname: string) {
  return new Promise<any>((resolve, reject) => {
    const options = { host: hostname, port: 443, servername: hostname };

    const socket = tls.connect(options, () => {
      const cert = socket.getPeerCertificate();

      if (!cert || Object.keys(cert).length === 0) {
        resolve(null);
        return;
      }

      const validTo = new Date(cert.valid_to);
      const daysRemaining = Math.floor((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      resolve({
        issuer: cert.issuer.O || cert.issuer.CN || "Unknown",
        validTo: validTo,
        daysRemaining: daysRemaining,
      });

      socket.end();
    });

    socket.on('error', (err) => resolve(null));
    socket.setTimeout(5000, () => { socket.destroy(); resolve(null); });
  });
}

export const handler = async (event: any) => {
  const isSqsMessage = !!event.Records;

  console.log("🚀 Worker Woke Up. Event Type:", isSqsMessage ? "Consumer (Queue)" : "Producer (Scheduler)");

  if (!isSqsMessage) {
    const action = event.action || "uptime";
    console.log(`⏰ Manager Mode. Action: ${action}`);

    const queueUrl = process.env.QUEUE_URL;
    if (!queueUrl) throw new Error("QUEUE_URL is missing! Add it to Lambda Environment Variables.");

    let items = [];

    if (action === "ssl-check") {

      const sslMonitors = await prisma.sSLMonitor.findMany();
      items = sslMonitors.map(m => ({ ...m, type: "ssl" }));
    } else {

      const monitors = await prisma.monitor.findMany({ where: { active: true } });
      items = monitors.map(m => ({ ...m, type: "uptime" }));
    }

    if (items.length === 0) {
      console.log("No monitors found.");
      return { status: "No active monitors found" };
    }

    console.log(`📝 Found ${items.length} monitors. Sending to Queue...`);

    for (let i = 0; i < items.length; i += 10) {
      const batch = items.slice(i, i + 10);
      const entries = batch.map((item) => ({
        Id: item.id,
        MessageBody: JSON.stringify(item),
      }));

      await sqs.send(new SendMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: entries,
      }));
    }

    console.log("✅ All jobs scheduled successfully.");
    return { status: "Scheduled", count: items.length };
  }

  console.log(`👷 Processing ${event.Records.length} jobs...`);
  
  for (const record of event.Records) {
    const job = JSON.parse(record.body);

    if (job.type === "ssl") {
      console.log(`🔒 Checking SSL for: ${job.domain}`);
      const sslData = await getSSLDetails(job.domain);

      if (sslData) {
        await prisma.sSLMonitor.update({
          where: { id: job.id },
          data: {
            status: "HEALTHY",
            issuer: sslData.issuer,
            validTo: sslData.validTo,
            daysRemaining: sslData.daysRemaining,
            lastCheck: new Date(),
          },
        });
      } else {
        await prisma.sSLMonitor.update({
          where: { id: job.id },
          data: { 
            status: "ERROR", 
            lastCheck: new Date() 
          },
        });
      }
    } 
    
    else {
      const start = Date.now();
      let statusCode = 0;
      let latency = 0;
      let status = "DOWN";

      try {
        console.log(`Checking: ${job.url}`);
        const response = await fetch(job.url);
        
        latency = Date.now() - start;
        statusCode = response.status;

        if (response.ok) {
          status = "UP";
        }
      } catch (error) {
        console.log(`Failed: ${job.url}`);
        status = "DOWN";
        statusCode = 500; 
      }

      await prisma.monitorCheck.create({
        data: {
          monitorId: job.id,
          statusCode: statusCode,
          latency: latency,
        },
      });
      
      await prisma.monitor.update({
          where: { id: job.id },
          data: { 
              status: status, 
              lastCheck: new Date(),
              totalChecks: { increment: 1 } 
          }
      });
    }
  }

  return { status: "Jobs Complete" };
};