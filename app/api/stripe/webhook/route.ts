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

  // 1. Verify Signature
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

  // 2. Handle Events
  try {
    const session = event.data.object as Stripe.Checkout.Session;

    // EVENT: CHECKOUT COMPLETED
    if (event.type === "checkout.session.completed") {
      // Validate User ID
      if (!session?.metadata?.userId) {
        console.error("❌ Metadata missing User ID. Cannot link subscription.");
        return new NextResponse("User ID is missing in metadata", { status: 400 });
      }

      console.log(`✅ Payment received for User: ${session.metadata.userId}`);

      // Fetch Subscription Details
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      // Update Database
      await prisma.user.update({
        where: { id: session.metadata.userId },
        data: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          // FIX: Use (subscription as any) to bypass the TypeScript error
          stripeCurrentPeriodEnd: new Date(
            (subscription as any).current_period_end * 1000
          ),
        },
      });

      console.log(`🎉 User ${session.metadata.userId} upgraded to Pro!`);
    }

    // EVENT: SUBSCRIPTION DELETED
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