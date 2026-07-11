import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp-relay.brevo.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const MAIL_TO = process.env.MAIL_TO || "info@clovertonhomes.com.au";
const MAIL_FROM = process.env.MAIL_FROM || "info@clovertonhomes.com.au";

let transporter: nodemailer.Transporter | null = null;
function getTransport(): nodemailer.Transporter {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });
    }
    return transporter;
}

export interface EnquiryEmail {
    name: string;
    email: string;
    phone?: string;
    message?: string;
    interestType?: string;
    homeType?: string;
    source?: string;
}

// Notify the business of a new website enquiry. Best-effort: returns false
// (without throwing) when SMTP isn't configured so the form still succeeds.
export async function sendEnquiryNotification(enquiry: EnquiryEmail): Promise<boolean> {
    if (!SMTP_USER || !SMTP_PASS) {
        console.warn("SMTP not configured — enquiry saved but email not sent");
        return false;
    }

    const rows: [string, string | undefined][] = [
        ["Name", enquiry.name],
        ["Email", enquiry.email],
        ["Phone", enquiry.phone],
        ["Interested in", enquiry.interestType],
        ["Home type", enquiry.homeType],
        ["Source", enquiry.source],
    ];
    const tableRows = rows
        .filter(([, v]) => v)
        .map(([k, v]) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:bold;">${k}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${v}</td></tr>`)
        .join("");

    const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#2d3a3a;padding:20px;text-align:center;"><h1 style="color:#fff;margin:0;">Cloverton Homes</h1></div>
            <div style="padding:24px;background:#f9f9f9;">
                <h2 style="color:#2d3a3a;margin-top:0;">New Website Enquiry</h2>
                <table style="width:100%;border-collapse:collapse;">${tableRows}</table>
                ${enquiry.message ? `<div style="margin-top:16px;padding:14px;background:#fff;border-radius:6px;"><strong>Message:</strong><p style="white-space:pre-wrap;color:#555;">${enquiry.message}</p></div>` : ""}
            </div>
        </div>`;

    try {
        await getTransport().sendMail({
            from: { name: "Cloverton Homes", address: MAIL_FROM },
            to: MAIL_TO,
            replyTo: { name: enquiry.name, address: enquiry.email },
            subject: `New Enquiry from ${enquiry.name}`,
            html,
        });
        return true;
    } catch (err: any) {
        console.error("Failed to send enquiry email:", err?.message || err);
        return false;
    }
}
