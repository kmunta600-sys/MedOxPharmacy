const nodemailer = require('nodemailer');

async function testEmail() {
    try {
        console.log('📧 Testing email connection...');
        console.log('   Host: smtp.gmail.com');
        console.log('   Port: 587');
        console.log('   User: ');
        console.log('');

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: '',
                pass: ''
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify connection first
        console.log('🔐 Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection verified!');

        // Send test email
        console.log('📧 Sending test email...');
        const info = await transporter.sendMail({
            from: '"MedOx Pharmacy" <>',
            to: '',
            subject: '✅ Test Email from MedOx Pharmacy',
            text: 'This is a test email to confirm email sending is working!'
        });

        console.log('✅ Test email sent!');
        console.log('   Message ID:', info.messageId);
        console.log('   Check your inbox at: ');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('');
        console.log('📋 Troubleshooting:');
        console.log('   1. Make sure 2-Step Verification is ON');
        console.log('   2. Make sure you are using an App Password');
        console.log('   3. Check your internet connection');
        console.log('   4. Try port 465 with secure: true');
    }
}

testEmail();
