const nodemailer = require("nodemailer");
const dns = require("dns");

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

const sendEmail = async ({ to, subject, html, text }) => {
    const user = (process.env.EMAIL_USER || "bhawrasanjeev@gmail.com").trim();
    const pass = (process.env.EMAIL_PASS || "yihlnigvvepnviyd").trim().replace(/\s+/g, "");
    const rawHost = process.env.EMAIL_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.EMAIL_PORT) || 587;

    const mailOptions = {
        from: `"CampusCrate Lost & Found" <${user}>`,
        to: to,
        subject: subject,
        html: html,
        text: text || "Your CampusCrate 6-digit OTP verification code."
    };

    // Option 1: Nodemailer Direct SMTP (Gmail App Password) - Primary & Works for ALL Recipient Emails
    if (user && pass) {
        let targetIp = rawHost;
        try {
            const ipv4Addresses = await new Promise((resolve, reject) => {
                dns.resolve4(rawHost, (err, addrs) => (err || !addrs || addrs.length === 0 ? reject(err) : resolve(addrs)));
            });
            if (ipv4Addresses && ipv4Addresses.length > 0) {
                targetIp = ipv4Addresses[0];
            }
        } catch (dnsErr) {
            // Fallback to raw host if DNS lookup fails
        }

        console.log(`📧 Dispatching Nodemailer Email to ${to} using ${user} (${targetIp}:${port})...`);

        try {
            const primaryTransporter = nodemailer.createTransport({
                host: targetIp,
                port: port,
                secure: port === 465,
                requireTLS: port === 587,
                auth: { user, pass },
                tls: { rejectUnauthorized: false, servername: rawHost },
                connectionTimeout: 12000,
                greetingTimeout: 12000,
                socketTimeout: 12000
            });

            const info = await primaryTransporter.sendMail(mailOptions);
            console.log(`✅ Nodemailer Email Sent Successfully to ${to} on port ${port}. Message ID: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error(`❌ Primary Nodemailer Error (Port ${port}):`, error.message || error);

            // Try Port 465 SSL Fallback
            try {
                console.log("🔄 Attempting Nodemailer Fallback (Port 465)...");
                const fallback465 = nodemailer.createTransport({
                    host: targetIp,
                    port: 465,
                    secure: true,
                    auth: { user, pass },
                    tls: { rejectUnauthorized: false, servername: rawHost },
                    connectionTimeout: 12000,
                    socketTimeout: 12000
                });
                const info = await fallback465.sendMail(mailOptions);
                console.log(`✅ Nodemailer Fallback (465) Sent Successfully to ${to}. Message ID: ${info.messageId}`);
                return info;
            } catch (fbErr) {
                console.error("❌ Nodemailer Port 465 Fallback Error:", fbErr.message || fbErr);
            }
        }
    }

    // Option 2: RESEND HTTPS REST API Fallback
    if (process.env.RESEND_API_KEY) {
        const cleanedResendKey = process.env.RESEND_API_KEY.replace(/["'\s]/g, "");
        const fromEmail = process.env.RESEND_FROM_EMAIL || "CampusCrate <onboarding@resend.dev>";
        
        console.log(`📧 Dispatching Email via Resend HTTPS API to ${to}...`);
        try {
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${cleanedResendKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    from: fromEmail,
                    to: [to],
                    subject: subject,
                    html: html,
                    text: text || "Your CampusCrate 6-digit OTP code."
                })
            });
            const data = await response.json();
            if (response.ok) {
                console.log(`✅ Resend Email Sent Successfully to ${to}. Message ID: ${data.id}`);
                return data;
            } else {
                console.error("❌ Resend API Error Response:", data);
            }
        } catch (apiErr) {
            console.error("❌ Resend Fetch Exception:", apiErr.message || apiErr);
        }
    }

    // Option 3: Brevo HTTPS REST API Fallback
    if (process.env.BREVO_API_KEY) {
        const cleanedBrevoKey = process.env.BREVO_API_KEY.replace(/["'\s]/g, "");
        console.log(`📧 Dispatching Email via Brevo HTTPS API to ${to}...`);
        try {
            const response = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "api-key": cleanedBrevoKey,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    sender: { name: "CampusCrate Lost & Found", email: user },
                    to: [{ email: to }],
                    subject: subject,
                    htmlContent: html
                })
            });
            const data = await response.json();
            if (response.ok) {
                console.log(`✅ Brevo Email Sent Successfully to ${to}. Message ID: ${data.messageId}`);
                return data;
            } else {
                console.error("❌ Brevo API Error:", data);
            }
        } catch (apiErr) {
            console.error("❌ Brevo Fetch Error:", apiErr.message || apiErr);
        }
    }

    return null;
};

module.exports = sendEmail;
