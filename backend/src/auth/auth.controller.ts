import { Controller, Get, Post, Request, Patch, Param, Body, HttpException, HttpStatus, Query, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Store } from '@prisma/client';
 

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}


    @Get()
    async getAllAccounts(){
        return this.authService.findAllAccount();
    }

    @Get('/search/:id')
async AccountSearchById(@Param('id') id: string) { 
    try {
        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            throw new HttpException("Invalid ID", HttpStatus.BAD_REQUEST);
        }

        return await this.authService.findById(parsedId);
    } catch (error) {
        console.error('Error in controller:', error);
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

    @Post('/signup')
    async createAccount(@Body() body: {email: string, name: string, password: string, confirmPassword: string, store: Store}) {
        return this.authService.createAccount(body.email, body.name, body.password, body.confirmPassword, body.store);
    }

    @Post('/signin')
    async signIn(@Body() body: {email: string, password: string}) {
        return this.authService.login(body.email, body.password);
    }

    @Get('/verify')
    async verify(@Query('token') token: string) {
        console.log('Hit the /verify route');
        console.log('Token received:', token);  // Should log the token
        return this.authService.verifyEmail(token);
    }

    @Get('/delete/:id')
    async deleteAccount(@Param('id') id:string){
        try{
            const parsedId = parseInt(id);

            this.authService.deleteAccount(parsedId);
        }catch(e){
            console.log('trycatch error', e)
            throw new HttpException("Deletion error",HttpStatus.BAD_REQUEST);
        }
    }

    @Post('/jwt/verify-token')
  async verifyToken(@Request() req) {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('No token provided');
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = await this.authService.verifyToken(token);
      
      if (!decoded) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      
      // Optional: Check if user still exists or has required permissions
      
      return { valid: true, user: { id: decoded.sub, username: decoded.username } };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}