const nodemailer = require("nodemailer");
const dns = require("dns");

// Force IPv4 first DNS lookup to prevent ENETUNREACH on cloud environments (Render) without IPv6 support
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

const sendEmail = async ({ to, subject, html, text }) => {
    const user = (process.env.EMAIL_USER || "bhawrasanjeev@gmail.com").trim();
    const pass = (process.env.EMAIL_PASS || "yihl nigv vepn viyd").trim().replace(/\s+/g, "");
    const host = process.env.EMAIL_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.EMAIL_PORT) || 587;

    console.log(`📧 Dispatching Nodemailer Email to ${to} using sender ${user} (${host}:${port})...`);

    // Primary Transport: Forced IPv4 (family: 4) over Port 587 STARTTLS for Render
    const primaryTransporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: port === 465, // false for 587 (STARTTLS)
        requireTLS: port === 587,
        family: 4, // Explicitly force IPv4 socket connection
        auth: {
            user: user,
            pass: pass
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000
    });

    const mailOptions = {
        from: `"CampusCrate Lost & Found" <${user}>`,
        to: to,
        subject: subject,
        html: html,
        text: text || "Your CampusCrate 6-digit OTP verification code."
    };

    try {
        const info = await primaryTransporter.sendMail(mailOptions);
        console.log(`✅ Nodemailer Email Sent Successfully to ${to} on port ${port}. Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`❌ Primary Nodemailer Error (Port ${port}):`, error.message || error);

        // Fallback Transport: Try Gmail service with IPv4 forced
        console.log("🔄 Attempting fallback via Nodemailer Gmail service (IPv4 forced)...");
        try {
            const fallbackTransporter = nodemailer.createTransport({
                service: "gmail",
                family: 4, // Explicitly force IPv4 socket connection
                auth: { user, pass },
                tls: { rejectUnauthorized: false },
                connectionTimeout: 15000,
                socketTimeout: 15000
            });
            const info = await fallbackTransporter.sendMail(mailOptions);
            console.log(`✅ Nodemailer Fallback Email Sent Successfully to ${to}. Message ID: ${info.messageId}`);
            return info;
        } catch (fallbackErr) {
            console.error("❌ Nodemailer Fallback Error:", fallbackErr.message || fallbackErr);
        }
        return null;
    }
};

module.exports = sendEmail;
