"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mail_service_1 = require("../mail/mail.service");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    prisma;
    mailService;
    jwtService;
    constructor(prisma, mailService, jwtService) {
        this.prisma = prisma;
        this.mailService = mailService;
        this.jwtService = jwtService;
    }
    async createAccount(email, name, password, confirmPassword, store) {
        if (password != confirmPassword) {
            throw new common_1.HttpException("Password & confirm password do not match", common_1.HttpStatus.BAD_REQUEST);
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const token = await crypto.randomBytes(20).toString('hex');
        await this.prisma.user.create({
            data: { email, name, password: hashPassword, verificationToken: token, store },
        });
        await this.mailService.sendVerificationEmail(email, token);
        return "Verification email sent! please activate your account";
    }
    findAllAccount() {
        return this.prisma.user.findMany();
    }
    async login(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.HttpException("User not found", common_1.HttpStatus.NOT_FOUND);
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.BadRequestException("Invalid credentials");
        }
        if (!user.isVerified) {
            throw new common_1.HttpException("Account is not verified", common_1.HttpStatus.FORBIDDEN);
        }
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            token: await this.jwtService.signAsync(payload)
        };
    }
    async findById(id) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id }
            });
            if (!user) {
                throw new common_1.HttpException("User does not exist", common_1.HttpStatus.NOT_FOUND);
            }
            return {
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                isVerified: user.isVerified,
            };
        }
        catch (error) {
            throw new common_1.HttpException('Internal Server Error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyEmail(token) {
        const user = await this.prisma.user.findFirst({
            where: {
                verificationToken: token,
            },
        });
        console.log('User:', user);
        if (!user) {
            console.log('User not found');
            throw new common_1.HttpException("User not found", common_1.HttpStatus.NOT_FOUND);
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
    async deleteAccount(id) {
        const user = await this.prisma.user.findUnique({
            where: { id }
        });
        if (!user) {
            throw new common_1.HttpException("User not found", common_1.HttpStatus.NOT_FOUND);
        }
        await this.prisma.user.delete({ where: { id
            } });
        return "succesfully deleted";
    }
    async verifyToken(token) {
        try {
            return this.jwtService.verify(token);
        }
        catch (error) {
            return null;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map