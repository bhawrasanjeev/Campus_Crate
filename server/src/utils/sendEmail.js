const nodemailer = require("nodemailer");
const dns = require("dns");

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

// Custom DNS lookup function forcing IPv4 resolution only (prevents ENETUNREACH IPv6 on Render)
const customIPv4Lookup = (hostname, options, callback) => {
    return dns.lookup(hostname, { family: 4 }, (err, address, family) => {
        if (err) return callback(err);
        return callback(null, address, 4);
    });
};

const sendEmail = async ({ to, subject, html, text }) => {
    const user = (process.env.EMAIL_USER || "bhawrasanjeev@gmail.com").trim();
    const pass = (process.env.EMAIL_PASS || "yihlnigvvepnviyd").trim().replace(/\s+/g, "");
    const host = process.env.EMAIL_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.EMAIL_PORT) || 587;

    console.log(`📧 Dispatching Nodemailer Email to ${to} using sender ${user} (${host}:${port})...`);

    // Primary Transporter: Forced IPv4 DNS lookup over Port 587 STARTTLS
    const primaryTransporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: port === 465,
        requireTLS: port === 587,
        lookup: customIPv4Lookup,
        auth: {
            user: user,
            pass: pass
        },
        tls: {
            rejectUnauthorized: false,
            servername: host
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

        // Fallback Transporter 1: Port 465 with IPv4 forced
        console.log("🔄 Attempting Fallback 1: Port 465 (IPv4 forced)...");
        try {
            const fallbackTransporter465 = nodemailer.createTransport({
                host: host,
                port: 465,
                secure: true,
                lookup: customIPv4Lookup,
                auth: { user, pass },
                tls: { rejectUnauthorized: false, servername: host },
                connectionTimeout: 15000,
                socketTimeout: 15000
            });
            const info = await fallbackTransporter465.sendMail(mailOptions);
            console.log(`✅ Nodemailer Fallback (465) Sent Successfully to ${to}. Message ID: ${info.messageId}`);
            return info;
        } catch (fbErr1) {
            console.error("❌ Fallback 1 (Port 465) Error:", fbErr1.message || fbErr1);
        }

        // Fallback Transporter 2: Service 'gmail' with IPv4 forced
        console.log("🔄 Attempting Fallback 2: Nodemailer 'gmail' service (IPv4 forced)...");
        try {
            const fallbackTransporterService = nodemailer.createTransport({
                service: "gmail",
                lookup: customIPv4Lookup,
                auth: { user, pass },
                tls: { rejectUnauthorized: false },
                connectionTimeout: 15000,
                socketTimeout: 15000
            });
            const info = await fallbackTransporterService.sendMail(mailOptions);
            console.log(`✅ Nodemailer Fallback (Service) Sent Successfully to ${to}. Message ID: ${info.messageId}`);
            return info;
        } catch (fbErr2) {
            console.error("❌ Fallback 2 (Service) Error:", fbErr2.message || fbErr2);
        }

        return null;
    }
};

module.exports = sendEmail;
