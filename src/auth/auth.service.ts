import { Body, Injectable, HttpException, BadRequestException, HttpStatus } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { User, Store } from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt'; 

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mailService: MailService,
        private jwtService: JwtService,
    ) {}

    // creating account
    async createAccount(email: string, name: string, password: string, confirmPassword: string, store: Store): Promise<String>{
        if (password != confirmPassword) {
            throw new HttpException("Password & confirm password do not match", HttpStatus.BAD_REQUEST)
        }

        // hash password
        const hashPassword = await bcrypt.hash(password, 10);

        // generate token
        const token = await crypto.randomBytes(20).toString('hex')

        // create prisma db entry
        await this.prisma.user.create({
            data: { email, name, password: hashPassword, verificationToken: token, store },
          });

        // send email
        await this.mailService.sendVerificationEmail(email, token)

        return "Verification email sent! please activate your account"
    }

    // finding all acounts
    findAllAccount() {
        return this.prisma.user.findMany();    
    }

    // loging in
    async login(email: string, password: string):Promise <{ token: string }>{
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new BadRequestException("Invalid credentials");
            }
        
        if (!user.isVerified){
            throw new HttpException("Account is not verified", HttpStatus.FORBIDDEN);
        } 


        const payload = { sub: user.id, email: user.email, role: user.role };
        

        return {
            token: await this.jwtService.signAsync(payload)
        };
    }

    // find account by id
    async findById(id: number) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id }
            });
    
            if (!user) {
                throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
            }
    
            return {
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                isVerified: user.isVerified,
            };
        } catch (error) {
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // verify
    async verifyEmail(token: string) {
        
        const user = await this.prisma.user.findFirst({
            where: {
                verificationToken: token,  // Check if token matches
            },
        });
        console.log('User:', user);
    
        if (!user) {
            console.log('User not found');  // Debugging line
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }
    
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
            },
        });
    
        return "User is now verified";
    }
    
    // delete account
    async deleteAccount(id: number){
        const user = await this.prisma.user.findUnique({
            where: {id}
        })

        if (!user){
            throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        }

        await this.prisma.user.delete({where: 
            { id
        }});

        return "succesfully deleted" 
    }

    async verifyToken(token: string) {
        try {
          return this.jwtService.verify(token);
        } catch (error) {
          return null;
        }
    }
 // Forgot password functionality
 async forgotPassword(email: string): Promise<String> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
        where: { email },
    });

    // If user exists, generate a reset token and send an email
    if (user) {
        // Generate token
        const resetToken = await crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Update user with reset token
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        await this.mailService.sendPasswordResetEmail(email, resetToken);
    }

    // Always return the same message regardless of whether the user exists
    // This prevents user enumeration attacks
    return "If an account with that email exists, we sent a password reset link.";
}

// Reset password functionality
async resetPassword(token: string, password: string, confirmPassword: string): Promise<String> {
    // Check if passwords match
    if (password !== confirmPassword) {
        throw new HttpException("Passwords do not match", HttpStatus.BAD_REQUEST);
    }

    // Find user by reset token and ensure token hasn't expired
    const user = await this.prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: {
                gt: new Date(), // Token must be greater than current time (not expired)
            },
        },
    });

    if (!user) {
        throw new HttpException("Invalid or expired reset token", HttpStatus.BAD_REQUEST);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user with new password and clear reset token
    await this.prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        },
    });

    return "Password has been successfully reset";
}
}

