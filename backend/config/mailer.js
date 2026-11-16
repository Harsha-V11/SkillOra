
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_APP_PASSWORD.replace(/\s/g, ""),
  },
});

const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"SkillSwap" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "SkillSwap - Email Verification OTP",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to SkillSwap!</h2>
        <p>Your email verification code is:</p>
        <h1 style="letter-spacing: 8px; color: #159b83;">
          ${otp}
        </h1>
        <p>This OTP is valid for 5 minutes.</p>
        <p>If you did not request this code, please ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendOtpEmail };
