import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.name!,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/settings/billing`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/settings/billing`,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}