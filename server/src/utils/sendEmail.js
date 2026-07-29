const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const user = (process.env.EMAIL_USER || "").trim();
        const pass = (process.env.EMAIL_PASS || "").trim().replace(/\s+/g, "");

        let transporter;

        if (user && pass) {
            transporter = nodemailer.createTransport({
                service: process.env.EMAIL_SERVICE || "gmail",
                auth: {
                    user: user,
                    pass: pass
                }
            });
        } else {
            console.warn("⚠️ Nodemailer EMAIL_USER or EMAIL_PASS missing in server/.env");
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
        }

        const mailOptions = {
            from: `"CampusCrate Lost & Found" <${user || "bhawrasanjeev@gmail.com"}>`,
            to: to,
            subject: subject,
            html: html,
            text: text || "Your CampusCrate 6-digit OTP verification code."
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Nodemailer Real Gmail Email Sent to ${to}. Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error("❌ Nodemailer Send Email Failed Error:", error.message);
        return null;
    }
};

module.exports = sendEmail;
