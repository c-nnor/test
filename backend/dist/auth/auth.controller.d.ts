import { AuthService } from './auth.service';
import { Store } from '@prisma/client';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getAllAccounts(): Promise<{
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
    AccountSearchById(id: string): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
        isVerified: boolean;
    }>;
    createAccount(body: {
        email: string;
        name: string;
        password: string;
        confirmPassword: string;
        store: Store;
    }): Promise<String>;
    signIn(body: {
        email: string;
        password: string;
    }): Promise<{
        token: string;
    }>;
    verify(token: string): Promise<string>;
    deleteAccount(id: string): Promise<void>;
    verifyToken(req: any): Promise<{
        valid: boolean;
        user: {
            id: any;
            username: any;
        };
    }>;
}
