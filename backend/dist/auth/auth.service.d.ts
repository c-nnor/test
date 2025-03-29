import { PrismaService } from "../prisma/prisma.service";
import { Store } from "@prisma/client";
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly prisma;
    private readonly mailService;
    private jwtService;
    constructor(prisma: PrismaService, mailService: MailService, jwtService: JwtService);
    createAccount(email: string, name: string, password: string, confirmPassword: string, store: Store): Promise<String>;
    findAllAccount(): import(".prisma/client").Prisma.PrismaPromise<{
        name: string;
        id: number;
        createdAt: Date;
        email: string;
        password: string;
        store: import(".prisma/client").$Enums.Store;
        isVerified: boolean;
        role: import(".prisma/client").$Enums.Role;
        verificationToken: string | null;
        updatedAt: Date;
    }[]>;
    login(email: string, password: string): Promise<{
        token: string;
    }>;
    findById(id: number): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
        isVerified: boolean;
    }>;
    verifyEmail(token: string): Promise<string>;
    deleteAccount(id: number): Promise<string>;
    verifyToken(token: string): Promise<any>;
}
