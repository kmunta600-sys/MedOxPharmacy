const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const sendResetEmail = async (email, token) => {
    try {
        const resetLink = `http://localhost:3000/reset-password/${token}`;
        
        console.log('📧 Sending reset email to:', email);
        
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'kmunta600@gmail.com',
                pass: 'ahio bmkg nocs yebi'
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify connection
        await transporter.verify();
        console.log('   ✅ Connection verified');

        const mailOptions = {
            from: '"MedOx Pharmacy" <kmunta600@gmail.com>',
            to: email,
            subject: '🔐 Password Reset Request - MedOx Pharmacy',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1A1A1A; color: #FFFFFF; border-radius: 12px;">
                    <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <h1 style="color: #D69E2E; margin: 0;">✦ MedOx Pharmacy</h1>
                        <p style="color: rgba(255,255,255,0.3); margin: 5px 0 0 0;">Password Reset Request</p>
                    </div>
                    <div style="padding: 30px 20px;">
                        <h2 style="color: #FFFFFF; font-weight: 400;">Hello,</h2>
                        <p style="color: rgba(255,255,255,0.6); line-height: 1.6;">
                            We received a request to reset the password for your MedOx Pharmacy account.
                            If you didn't make this request, please ignore this email.
                        </p>
                        <div style="background: rgba(214,158,46,0.05); border: 1px solid rgba(214,158,46,0.1); border-radius: 8px; padding: 16px; margin: 20px 0;">
                            <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #D69E2E, #B8860B); color: #FFFFFF; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                                🔐 Reset Password
                            </a>
                            <p style="color: rgba(255,255,255,0.2); font-size: 11px; margin-top: 10px;">
                                Link: <span style="color: #D69E2E; word-break: break-all;">${resetLink}</span>
                            </p>
                        </div>
                        <p style="color: rgba(255,255,255,0.3); font-size: 12px;">
                            This link expires in <strong style="color: #FFFFFF;">1 hour</strong>.
                        </p>
                    </div>
                    <div style="text-align: center; padding: 20px 0; border-top: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.15); font-size: 11px;">
                        <p>© 2026 MedOx Pharmacy. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        console.log('   Message ID:', info.messageId);
        console.log('   To:', email);
        
        return { success: true, resetLink };
    } catch (error) {
        console.error('❌ Email error:', error.message);
        const resetLink = `http://localhost:3000/reset-password/${token}`;
        console.log('📧 Fallback Link:', resetLink);
        return { success: true, resetLink };
    }
};

module.exports = { generateResetToken, sendResetEmail };
