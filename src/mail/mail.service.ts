import { Injectable } from '@nestjs/common';
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
          },
        });
      }

      async sendVerificationEmail(to: string, token: string): Promise<void> {
        const verificationUrl = `${process.env.APP_URL || 'https://travelpathmanager.co.uk'}/auth/verify?token=${token}`;
    
        const mailOptions = {
          from: '"McDonald\'s Travel Path App" <no-reply@mcdapp.com>',
          to,
          subject: 'Email Verification',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
              <h2 style="color: #d52b1e;">McDonald's Travel Path App</h2>
              <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
              <p>
                <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #d52b1e; color: white; text-decoration: none; border-radius: 5px;">
                  Verify Your Email
                </a>
              </p>
              <p>Or copy and paste this link in your browser:</p>
              <p>${verificationUrl}</p>
              <p>If you did not request this, please ignore this email.</p>
            </div>
          `
        };
    
        await this.transporter.sendMail(mailOptions);
      }

      async sendPasswordResetEmail(to: string, token: string): Promise<void> {
        const resetUrl = `${process.env.APP_URL || 'https://travelpathmanager.co.uk'}/reset-password?token=${token}`;
        
        const mailOptions = {
          from: '"McDonald\'s Travel Path App" <no-reply@mcdapp.com>',
          to,
          subject: 'Password Reset',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
              <h2 style="color: #d52b1e;">McDonald's Travel Path App</h2>
              <p>You requested a password reset. Click the button below to reset your password:</p>
              <p>
                <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #d52b1e; color: white; text-decoration: none; border-radius: 5px;">
                  Reset Password
                </a>
              </p>
              <p>Or copy and paste this link in your browser:</p>
              <p>${resetUrl}</p>
              <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
              <p>This link is valid for 1 hour.</p>
            </div>
          `
        };

        await this.transporter.sendMail(mailOptions);
      }

}
