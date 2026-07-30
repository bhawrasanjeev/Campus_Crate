const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html, text }) => {
    const user = (process.env.EMAIL_USER || "bhawrasanjeev@gmail.com").trim();
    const pass = (process.env.EMAIL_PASS || "yihl nigv vepn viyd").trim().replace(/\s+/g, "");
    const host = process.env.EMAIL_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.EMAIL_PORT) || 587;

    console.log(`📧 Dispatching Nodemailer Email to ${to} using sender ${user} (${host}:${port})...`);

    // Primary Transport: Port 587 STARTTLS (Recommended for cloud platforms like Render)
    const primaryTransporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: port === 465, // false for 587 (STARTTLS)
        requireTLS: port === 587,
        auth: {
            user: user,
            pass: pass
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
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

        // Auto Fallback: If Port 587 times out on Render, attempt fallback via 'service: gmail'
        if (port === 587 && (error.code === "ETIMEDOUT" || (error.message && error.message.includes("timeout")))) {
            console.log("🔄 Timeout on Port 587. Attempting fallback via Nodemailer Gmail service...");
            try {
                const fallbackTransporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: { user, pass },
                    tls: { rejectUnauthorized: false },
                    connectionTimeout: 10000,
                    socketTimeout: 10000
                });
                const info = await fallbackTransporter.sendMail(mailOptions);
                console.log(`✅ Nodemailer Fallback Email Sent Successfully to ${to}. Message ID: ${info.messageId}`);
                return info;
            } catch (fallbackErr) {
                console.error("❌ Nodemailer Fallback Error:", fallbackErr.message || fallbackErr);
            }
        }
        return null;
    }
};

module.exports = sendEmail;
