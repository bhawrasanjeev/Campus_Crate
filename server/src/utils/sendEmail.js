const nodemailer = require("nodemailer");
const dns = require("dns");

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

// Custom DNS lookup function forcing IPv4 resolution only
const customIPv4Lookup = (hostname, options, callback) => {
    return dns.lookup(hostname, { family: 4 }, (err, address, family) => {
        if (err) return callback(err);
        return callback(null, address, 4);
    });
};

const sendEmail = async ({ to, subject, html, text }) => {
    const user = (process.env.EMAIL_USER || "bhawrasanjeev@gmail.com").trim();
    const pass = (process.env.EMAIL_PASS || "yihlnigvvepnviyd").trim().replace(/\s+/g, "");

    // Option 1: RESEND HTTPS REST API (Primary Email Service - Works 100% on Port 443)
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
                if (data.message && data.message.includes("testing emails")) {
                    console.warn("💡 Resend Hint: To send emails to any recipient email address with Resend, add & verify a free domain at https://resend.com/domains or set RESEND_FROM_EMAIL in Render.");
                }
            }
        } catch (apiErr) {
            console.error("❌ Resend Fetch Exception:", apiErr.message || apiErr);
        }
    }

    // Option 2: Brevo HTTPS REST API Fallback
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

    // Option 3: SendGrid HTTPS REST API (Port 443 - 100 free emails/day)
    if (process.env.SENDGRID_API_KEY) {
        const cleanedSGKey = process.env.SENDGRID_API_KEY.replace(/["'\s]/g, "");
        console.log(`📧 Dispatching Email via SendGrid HTTPS API to ${to}...`);
        try {
            const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${cleanedSGKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    personalizations: [{ to: [{ email: to }] }],
                    from: { email: user, name: "CampusCrate Lost & Found" },
                    subject: subject,
                    content: [{ type: "text/html", value: html }]
                })
            });
            if (response.status === 202 || response.ok) {
                console.log(`✅ SendGrid Email Sent Successfully to ${to}`);
                return { success: true };
            } else {
                const data = await response.json().catch(() => ({}));
                console.error("❌ SendGrid API Error:", response.status, data);
            }
        } catch (apiErr) {
            console.error("❌ SendGrid Fetch Error:", apiErr.message || apiErr);
        }
    }

    // Option 3: Nodemailer Direct SMTP with Explicit IPv4 Resolution
    const rawHost = process.env.EMAIL_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.EMAIL_PORT) || 587;

    // Resolve hostname to literal IPv4 IP to guarantee no IPv6 ENETUNREACH
    let targetIp = rawHost;
    try {
        const ipv4Addresses = await new Promise((resolve, reject) => {
            dns.resolve4(rawHost, (err, addrs) => (err || !addrs || addrs.length === 0 ? reject(err) : resolve(addrs)));
        });
        if (ipv4Addresses && ipv4Addresses.length > 0) {
            targetIp = ipv4Addresses[0];
            console.log(`🌐 Resolved ${rawHost} to IPv4 IP: ${targetIp}`);
        }
    } catch (dnsErr) {
        console.warn("DNS IPv4 resolution notice (using raw host):", dnsErr.message);
    }

    console.log(`📧 Dispatching Nodemailer Email to ${to} using sender ${user} (${targetIp}:${port})...`);

    const primaryTransporter = nodemailer.createTransport({
        host: targetIp,
        port: port,
        secure: port === 465,
        requireTLS: port === 587,
        auth: { user, pass },
        tls: { rejectUnauthorized: false, servername: rawHost },
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

        console.log("🔄 Attempting Fallback: Port 465...");
        try {
            const fallback465 = nodemailer.createTransport({
                host: targetIp,
                port: 465,
                secure: true,
                auth: { user, pass },
                tls: { rejectUnauthorized: false, servername: rawHost },
                connectionTimeout: 15000,
                socketTimeout: 15000
            });
            const info = await fallback465.sendMail(mailOptions);
            console.log(`✅ Nodemailer Fallback (465) Sent Successfully to ${to}. Message ID: ${info.messageId}`);
            return info;
        } catch (fbErr1) {
            console.error("❌ Fallback (Port 465) Error:", fbErr1.message || fbErr1);
        }
        return null;
    }
};

module.exports = sendEmail;
