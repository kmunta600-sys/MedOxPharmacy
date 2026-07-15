const nodemailer = require('nodemailer');

// Email configuration with better error handling
const createTransporter = () => {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('⚠️ Email not configured. Skipping email send.');
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
        // Force IPv4 to avoid ENETUNREACH errors
        family: 4,
    });
};

// Send reset email - NON-BLOCKING version
const sendResetEmail = (email, token) => {
    console.log('📧 Sending reset email to:', email);
    console.log('🔑 Token:', token ? token.substring(0, 20) + '...' : 'No token');

    return new Promise((resolve) => {
        try {
            const transporter = createTransporter();
            if (!transporter) {
                console.log('⚠️ No transporter - email not configured');
                resolve({
                    success: false,
                    error: 'Email not configured',
                    message: 'Password reset email could not be sent. Please contact support.'
                });
                return;
            }

            const resetLink = `https://frontend-pearl-two-44.vercel.app/reset-password?token=${token}`;

            const mailOptions = {
                from: process.env.EMAIL_FROM || 'MedOx Pharmacy <noreply@medoxpharmacy.com>',
                to: email,
                subject: 'Password Reset - MedOx Pharmacy',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #f5f7fa; border-radius: 12px;">
                        <div style="text-align: center; margin-bottom: 24px;">
                            <h1 style="color: #D69E2E; margin: 0;">MedOx Pharmacy</h1>
                            <p style="color: #666; margin: 4px 0 0 0;">Smart Inventory System</p>
                        </div>
                        <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                            <h2 style="color: #1A1A2E; margin: 0 0 12px 0;">Password Reset Request</h2>
                            <p style="color: #333; line-height: 1.6;">
                                We received a request to reset your password for your MedOx Pharmacy account.
                            </p>
                            <p style="text-align: center; margin: 24px 0;">
                                <a href="${resetLink}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #D69E2E, #B8860B); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                                    Reset Password
                                </a>
                            </p>
                            <p style="color: #666; font-size: 14px; line-height: 1.6;">
                                If you didn't request this, please ignore this email.
                                <br><br>
                                This link will expire in 1 hour.
                            </p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;">
                            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                                If the button above doesn't work, copy and paste this link into your browser:
                                <br>
                                <span style="color: #666; word-break: break-all;">${resetLink}</span>
                            </p>
                        </div>
                        <div style="text-align: center; margin-top: 16px;">
                            <p style="color: #999; font-size: 12px; margin: 0;">
                                © 2026 MedOx Pharmacy • Powered by CytochromeRX
                            </p>
                        </div>
                    </div>
                `,
                text: `
Password Reset - MedOx Pharmacy

We received a request to reset your password.

Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

© 2026 MedOx Pharmacy
                `
            };

            // Send email with timeout
            transporter.sendMail(mailOptions)
                .then((result) => {
                    console.log('✅ Password reset email sent to:', email);
                    console.log('   Message ID:', result.messageId);
                    resolve({
                        success: true,
                        messageId: result.messageId,
                        message: 'Password reset instructions sent to your email'
                    });
                })
                .catch((error) => {
                    console.error('❌ Email send error:', error.message);
                    resolve({
                        success: false,
                        error: error.message,
                        message: 'Password reset email could not be sent. Please try again later or contact support.'
                    });
                });

            // Set a timeout in case the email takes too long
            setTimeout(() => {
                // If the promise hasn't resolved yet, resolve with a timeout error
                console.log('⏰ Email send timeout after 20 seconds');
                resolve({
                    success: false,
                    error: 'Timeout waiting for email to send',
                    message: 'Password reset email could not be sent. Please try again later or contact support.'
                });
            }, 20000);

        } catch (error) {
            console.error('❌ Email send error:', error.message);
            resolve({
                success: false,
                error: error.message,
                message: 'Password reset email could not be sent. Please try again later or contact support.'
            });
        }
    });
};

module.exports = { sendResetEmail };

