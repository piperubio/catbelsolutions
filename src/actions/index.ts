import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { Resend } from "resend";

export const server = {
  sendContactEmail: defineAction({
    accept: "form",
    input: z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email address"),
      phone: z.string().min(1, "Phone is required"),
      message: z.string().min(1, "Message is required"),
    }),
    handler: async (input) => {
      const resend = new Resend(import.meta.env.RESEND_API_KEY);
      const senderEmail = import.meta.env.SENDER_EMAIL;
      const receiverEmail = import.meta.env.RECEIVER_EMAIL;

      if (!(receiverEmail && senderEmail)) {
        throw new Error(
          "RECEIVER_EMAIL or SENDER_EMAIL environment variable is not set"
        );
      }

      const { data, error } = await resend.emails.send({
        from: `Catbel Web <${senderEmail}>`,
        to: [receiverEmail],
        subject: `New Contact Form Submission from ${input.name}`,
        html: `
          <h2>New Contact Request</h2>
          <p><strong>Name:</strong> ${input.name}</p>
          <p><strong>Email:</strong> ${input.email}</p>
          <p><strong>Phone:</strong> ${input.phone}</p>
          <p><strong>Message:</strong></p>
          <p>${input.message.replace(/\n/g, "<br>")}</p>
        `,
      });

      if (error) {
        console.error("Resend Error:", error);
        throw new Error(error.message);
      }

      return { success: true, id: data?.id };
    },
  }),
};
