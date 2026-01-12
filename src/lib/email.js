import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendVerificationEmail(email, code) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email - Couple Schedule Manager",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .code { font-size: 32px; font-weight: bold; color: #dc4c3e; text-align: center; padding: 20px; background: #f8f8f8; border-radius: 8px; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👩‍❤️‍👨 Couple Schedule Manager</h1>
            <p>Verify your email address</p>
          </div>
          <p>Hello,</p>
          <p>Thank you for signing up! Please use the following verification code to complete your registration:</p>
          <div class="code">${code}</div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <div class="footer">
            <p>Best regards,<br>Couple Schedule Manager Team</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
}

// NEW: Password Reset Email
export async function sendPasswordResetEmail(email, code) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Password - Couple Schedule Manager",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
          .container { background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .code { font-size: 32px; font-weight: bold; color: #dc4c3e; text-align: center; padding: 20px; background: #f8f8f8; border-radius: 8px; letter-spacing: 5px; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset Request</h1>
            <p>Reset your password</p>
          </div>
          <p>Hello,</p>
          <p>We received a request to reset your password. Please use the following code to reset your password:</p>
          <div class="code">${code}</div>
          <p>This code will expire in 15 minutes.</p>
          <div class="warning">
            <strong>⚠️ Security Warning:</strong><br>
            If you didn't request this password reset, please ignore this email and ensure your account is secure.
          </div>
          <div class="footer">
            <p>Best regards,<br>Couple Schedule Manager Team</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
}
