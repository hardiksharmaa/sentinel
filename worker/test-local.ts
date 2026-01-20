import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { handler } from "./index";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const sqs = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function poll() {
  console.log("👷 Local Worker polling for messages...");
  
  while (true) {
    try {
      const { Messages } = await sqs.send(new ReceiveMessageCommand({
        QueueUrl: process.env.AWS_SQS_QUEUE_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 5, 
      }));

      if (!Messages || Messages.length === 0) {
        continue;
      }

      console.log(`📦 Received ${Messages.length} messages.`);

      const event: any = {
        Records: Messages.map(msg => ({
          body: msg.Body,
          messageId: msg.MessageId,
        }))
      };

      await handler(event);

      for (const msg of Messages) {
        await sqs.send(new DeleteMessageCommand({
          QueueUrl: process.env.AWS_SQS_QUEUE_URL,
          ReceiptHandle: msg.ReceiptHandle,
        }));
      }

    } catch (error) {
      console.error("Polling Error:", error);
      await new Promise(res => setTimeout(res, 5000)); // Wait before retrying
    }
  }
}

poll();