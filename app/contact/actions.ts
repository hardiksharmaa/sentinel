"use server";

import nodemailer from "nodemailer";

export async function sendContactEmail(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  // Simple validation
  if (!email || !message) {
    return { error: "Email and Message are required." };
  }

  try {
    // 1. Configure the Transporter (Use your Gmail credentials)
    // NOTE: For Gmail, you MUST use an "App Password", not your main password.
    // Go to Google Account > Security > 2-Step Verification > App Passwords
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address (e.g. "you@gmail.com")
        pass: process.env.EMAIL_PASS, // Your Gmail App Password
      },
    });

    // 2. Send the Email
    await transporter.sendMail({
      from: `"Sentinel Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send it to yourself
      replyTo: email, // So you can hit "Reply" to answer the user
      subject: `New Contact Form Submission from ${firstName} ${lastName}`,
      text: `
        Name: ${firstName} ${lastName}
        Email: ${email}
        
        Message:
        ${message}
      `,
      html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <br/>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Email Error:", error);
    return { error: "Failed to send message. Please try again later." };
  }
}