import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// Default sender configuration
const defaultSender = {
    name: "Cloverton Homes",
    email: env.MAIL_FROM,
};

// Lazily-created SMTP transport (Brevo free relay by default).
let transporter: nodemailer.Transporter | null = null;
function getTransport(): nodemailer.Transporter {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_PORT === 465, // 465 = implicit TLS; 587 = STARTTLS
            auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
        });
    }
    return transporter;
}

export interface EmailOptions {
    to: { email: string; name?: string }[];
    subject: string;
    htmlContent: string;
    textContent?: string;
    replyTo?: { email: string; name?: string };
    sender?: { name: string; email: string };
}

export const emailService = {
    /**
     * Send a transactional email over SMTP (Brevo relay / any SMTP provider).
     */
    async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
        if (!env.SMTP_USER || !env.SMTP_PASS) {
            const msg = "SMTP not configured (SMTP_USER/SMTP_PASS missing) — skipping email send";
            console.warn(msg);
            return { success: false, error: msg };
        }
        try {
            const sender = options.sender || defaultSender;
            const info = await getTransport().sendMail({
                from: { name: sender.name, address: sender.email },
                to: options.to.map(t => (t.name ? { name: t.name, address: t.email } : t.email)) as any,
                subject: options.subject,
                html: options.htmlContent,
                text: options.textContent,
                replyTo: options.replyTo
                    ? { name: options.replyTo.name || "", address: options.replyTo.email }
                    : undefined,
            });

            console.log("Email sent successfully:", info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error: any) {
            console.error("Failed to send email:", error?.message || error);
            return { success: false, error: error?.message || "Failed to send email" };
        }
    },

    /**
     * Send enquiry notification to admin
     */
    async sendEnquiryNotification(enquiry: {
        name: string;
        email: string;
        phone?: string;
        message: string;
        type?: string;
        propertyTitle?: string;
        designTitle?: string;
    }): Promise<{ success: boolean; error?: string }> {
        const subject = `New ${enquiry.type || "General"} Enquiry from ${enquiry.name}`;

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #2d3a3a; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Cloverton Homes</h1>
                </div>
                <div style="padding: 30px; background-color: #f9f9f9;">
                    <h2 style="color: #2d3a3a; margin-top: 0;">New Enquiry Received</h2>
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${enquiry.name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                                <a href="mailto:${enquiry.email}">${enquiry.email}</a>
                            </td>
                        </tr>
                        ${enquiry.phone ? `
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                                <a href="tel:${enquiry.phone}">${enquiry.phone}</a>
                            </td>
                        </tr>
                        ` : ""}
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Type:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${enquiry.type || "General"}</td>
                        </tr>
                        ${enquiry.propertyTitle ? `
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Property:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${enquiry.propertyTitle}</td>
                        </tr>
                        ` : ""}
                        ${enquiry.designTitle ? `
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Design:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${enquiry.designTitle}</td>
                        </tr>
                        ` : ""}
                    </table>
                    
                    <div style="margin-top: 20px; padding: 15px; background-color: white; border-radius: 5px;">
                        <h3 style="margin-top: 0; color: #2d3a3a;">Message:</h3>
                        <p style="white-space: pre-wrap; color: #555;">${enquiry.message}</p>
                    </div>
                </div>
                <div style="padding: 15px; background-color: #2d3a3a; text-align: center;">
                    <p style="color: #999; margin: 0; font-size: 12px;">
                        This email was sent from the Cloverton Homes website contact form.
                    </p>
                </div>
            </div>
        `;

        return this.sendEmail({
            to: [{ email: env.MAIL_TO, name: "Cloverton Homes" }],
            subject,
            htmlContent,
            replyTo: { email: enquiry.email, name: enquiry.name },
        });
    },

    /**
     * Send confirmation email to customer
     */
    async sendEnquiryConfirmation(customerEmail: string, customerName: string): Promise<{ success: boolean; error?: string }> {
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #2d3a3a; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Cloverton Homes</h1>
                </div>
                <div style="padding: 30px; background-color: #f9f9f9;">
                    <h2 style="color: #2d3a3a; margin-top: 0;">Thank You for Your Enquiry</h2>
                    
                    <p style="color: #555; line-height: 1.6;">
                        Dear ${customerName},
                    </p>
                    
                    <p style="color: #555; line-height: 1.6;">
                        Thank you for getting in touch with Cloverton Homes. We have received your enquiry and one of our consultants will be in contact with you shortly.
                    </p>
                    
                    <p style="color: #555; line-height: 1.6;">
                        In the meantime, feel free to explore our range of home designs and packages on our website.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://clovertonhomes.com.au" style="background-color: #2d3a3a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Visit Our Website
                        </a>
                    </div>
                    
                    <p style="color: #555; line-height: 1.6;">
                        Best regards,<br>
                        <strong>The Cloverton Homes Team</strong>
                    </p>
                </div>
                <div style="padding: 15px; background-color: #2d3a3a; text-align: center;">
                    <p style="color: #999; margin: 0; font-size: 12px;">
                        © ${new Date().getFullYear()} Cloverton Homes. All rights reserved.
                    </p>
                </div>
            </div>
        `;

        return this.sendEmail({
            to: [{ email: customerEmail, name: customerName }],
            subject: "Thank You for Contacting Cloverton Homes",
            htmlContent,
        });
    },
};
