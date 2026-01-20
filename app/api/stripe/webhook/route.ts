import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headerPayload = await headers();
  const signature = headerPayload.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`❌ Webhook Signature Error: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }
  try {
    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
      if (!session?.metadata?.userId) {
        console.error("❌ Metadata missing User ID. Cannot link subscription.");
        return new NextResponse("User ID is missing in metadata", { status: 400 });
      }

      console.log(`✅ Payment received for User: ${session.metadata.userId}`);


      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      let periodEnd = (subscription as any).current_period_end;

      if (!periodEnd) {
        console.warn("⚠️ Warning: Stripe did not return current_period_end. Defaulting to 30 days.");
        periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
      }

      await prisma.user.update({
        where: { id: session.metadata.userId },
        data: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(periodEnd * 1000),
        },
      });

      console.log(`🎉 User ${session.metadata.userId} upgraded to Pro!`);
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      
      const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id }
      });

      if (user) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                stripePriceId: null,
                stripeCurrentPeriodEnd: null,
            }
        });
        console.log(`Subscription deleted for user ${user.id}`);
      }
    }

    return new NextResponse(null, { status: 200 });

  } catch (error: any) {
    console.error("❌ Database/Logic Error inside Webhook:", error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}