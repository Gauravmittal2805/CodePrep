import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendWelcomeEmail = async (email: string, fullName: string) => {
    const mailOptions = {
        from: `"CodePrep Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to CodePrep! 🚀',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #6366f1; margin: 0;">CodePrep</h1>
                </div>
                <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px;">
                    <h2 style="color: #111827; margin-top: 0;">Welcome, ${fullName}! 👋</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        We're thrilled to have you join our community of passionate coders. CodePrep is designed to help you master algorithms, ace your technical interviews, and supercharge your career.
                    </p>
                    <div style="margin: 30px 0; padding: 20px; background-color: #ffffff; border-left: 4px solid #6366f1; border-radius: 4px;">
                        <h3 style="margin-top: 0; color: #1f2937;">Ready to start?</h3>
                        <p style="color: #4b5563; margin-bottom: 20px;">Here is what you can do next:</p>
                        <ul style="color: #4b5563; padding-left: 20px;">
                            <li>Solve trending interview problems</li>
                            <li>Track your consistency with our dashboard</li>
                            <li>Compare your rank on the Global Leaderboard</li>
                            <li>Join upcoming coding contests</li>
                        </ul>
                    </div>
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL}/problems" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Start Solving
                        </a>
                    </div>
                </div>
                <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
                    <p>© 2026 CodePrep. All rights reserved.</p>
                    <p>If you have any questions, feel free to reply to this email.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email] Welcome email sent to: ${email}`);
    } catch (error) {
        console.error(`[Email Error] Failed to send welcome email to ${email}:`, error);
    }
};
