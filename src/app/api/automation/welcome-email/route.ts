import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    // Configure email transporter (using environment variables)
    // For MVP, we'll log the email instead of actually sending
    // In production, configure SMTP settings in environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@bizflow.app',
      to: email,
      subject: 'Welcome to BizFlow!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to BizFlow, ${name}!</h2>
          <p>Thank you for joining BizFlow. We're excited to have you on board!</p>
          <p>Your account has been successfully created and you can now start using our platform.</p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p style="margin-top: 30px;">
            Best regards,<br>
            The BizFlow Team
          </p>
        </div>
      `,
    };

    // For MVP: Log instead of sending (to avoid SMTP configuration requirement)
    if (!process.env.SMTP_USER) {
      console.log('Welcome email would be sent to:', email);
      console.log('Email content:', mailOptions);
      return NextResponse.json({ 
        success: true, 
        message: 'Email logged (SMTP not configured)' 
      });
    }

    // Actual email sending (when SMTP is configured)
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
