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

    // Option 1: Brevo HTTPS REST API (Recommended for Render - 100% success on Port 443 to ANY recipient email)
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

    // Option 2: Resend HTTPS REST API (Limits to account owner unless domain is verified)
    if (process.env.RESEND_API_KEY) {
        const cleanedResendKey = process.env.RESEND_API_KEY.replace(/["'\s]/g, "");
        console.log(`📧 Dispatching Email via Resend HTTPS API to ${to}...`);
        try {
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${cleanedResendKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    from: process.env.RESEND_FROM_EMAIL || "CampusCrate <onboarding@resend.dev>",
                    to: [to],
                    subject: subject,
                    html: html
                })
            });
            const data = await response.json();
            if (response.ok) {
                console.log(`✅ Resend Email Sent Successfully to ${to}. ID: ${data.id}`);
                return data;
            } else {
                console.warn("⚠️ Resend API Warning (Resend free sandbox limits external recipients to account owner. Falling through to SMTP):", data.message || data);
            }
        } catch (apiErr) {
            console.error("❌ Resend Fetch Error:", apiErr.message || apiErr);
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
