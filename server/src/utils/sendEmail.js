const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const user = (process.env.EMAIL_USER || "bhawrasanjeev@gmail.com").trim();
        const pass = (process.env.EMAIL_PASS || "ijevxuxjqqrcjyre").trim().replace(/\s+/g, "");

        console.log(`📧 Dispatching Nodemailer Email to ${to} using sender ${user}...`);

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
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

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Nodemailer Gmail Email Sent Successfully to ${to}. Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error("❌ Nodemailer Send Email Error:", error.message || error);
        return null;
    }
};

module.exports = sendEmail;
