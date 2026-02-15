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

export const sendBlockedEmail = async (email: string, fullName: string, reason: string) => {
    const mailOptions = {
        from: `"CodePrep Safety" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Important: Your CodePrep Account has been Restricted ⚠️',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fee2e2; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #ef4444; margin: 0;">CodePrep Safety</h1>
                </div>
                <div style="background-color: #fef2f2; padding: 30px; border-radius: 8px;">
                    <h2 style="color: #991b1b; margin-top: 0;">Account Restriction Notice</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Hello ${fullName},
                    </p>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        This email is to inform you that your CodePrep account has been restricted due to a violation of our community guidelines or terms of service.
                    </p>
                    <div style="margin: 25px 0; padding: 20px; background-color: #ffffff; border-left: 4px solid #ef4444; border-radius: 4px;">
                        <h3 style="margin-top: 0; color: #991b1b; font-size: 14px; text-transform: uppercase;">Reason for restriction:</h3>
                        <p style="color: #1f2937; margin-bottom: 0; font-weight: 500;">
                            ${reason}
                        </p>
                    </div>
                    <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                        While restricted, you will not be able to log in, submit solutions, or participate in contests. If you believe this was a mistake, you can reach out to our support team for an appeal.
                    </p>
                </div>
                <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
                    <p>© 2026 CodePrep Safety Team. All rights reserved.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email] Blocked notification sent to: ${email}`);
    } catch (error) {
        console.error(`[Email Error] Failed to send blocked email to ${email}:`, error);
    }
};

export const sendContestInvitationEmail = async (email: string, fullName: string, contestTitle: string, startTime: string) => {
    const mailOptions = {
        from: `"CodePrep Contests" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Invitation: ${contestTitle} starts soon! 🏆`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd6fe; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #7c3aed; margin: 0;">CodePrep Contests</h1>
                </div>
                <div style="background-color: #f5f3ff; padding: 30px; border-radius: 8px;">
                    <h2 style="color: #4c1d95; margin-top: 0;">You're Invited! 🌟</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Hello ${fullName},
                    </p>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        You have been specially invited by our admin team to participate in the upcoming coding contest: 
                        <strong style="color: #7c3aed;">${contestTitle}</strong>.
                    </p>
                    
                    <div style="margin: 25px 0; padding: 20px; background-color: #ffffff; border-left: 4px solid #7c3aed; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                        <h3 style="margin-top: 0; color: #1f2937; font-size: 14px; text-transform: uppercase;">Contest Schedule:</h3>
                        <p style="color: #111827; margin-bottom: 0; font-weight: 600; font-size: 16px;">
                            📅 ${new Date(startTime).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                        </p>
                    </div>

                    <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                        Show off your coding skills, climb the leaderboard, and see how you rank against other elite developers in this exclusive invite-only event.
                    </p>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL}/contests" style="background-color: #7c3aed; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.2);">
                            View Contest Details
                        </a>
                    </div>
                </div>
                <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
                    <p>© 2026 CodePrep Team. All rights reserved.</p>
                    <p>This is an automated invitation. Good luck for the contest!</p>
                </div>
            </div>
        `
    };

    try {
        console.log(`[Email] Attempting to send contest invitation to ${email}...`);
        await transporter.sendMail(mailOptions);
        console.log(`[Email] Contest invitation sent to: ${email}`);
    } catch (error) {
        console.error(`[Email Error] Failed to send contest invitation to ${email}:`, error);
    }
};
