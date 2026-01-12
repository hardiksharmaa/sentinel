import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  
  // FIX: await headers() before using it
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
    console.error(`Webhook Error: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Handle: Subscription Created / Updated
  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    if (!session?.metadata?.userId) {
      return new NextResponse("User ID is missing in metadata", { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.metadata.userId },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        // FIX: Cast subscription to 'any' to satisfy TypeScript
        stripeCurrentPeriodEnd: new Date(
          (subscription as any).current_period_end * 1000
        ),
      },
    });
  }

  // Handle: Subscription Deleted (User cancelled)
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    
    // Find user by subscription ID
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
    }
  }

  return new NextResponse(null, { status: 200 });
}