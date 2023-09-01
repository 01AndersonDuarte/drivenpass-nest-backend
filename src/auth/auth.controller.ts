import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('/sign-up')
    async signUp(@Body() newUser: SignUpDto) {
        return await this.authService.signUp(newUser);
    }

    @Post('/sign-in')
    @HttpCode(HttpStatus.OK)
    async signIn(@Body() userLogin: SignInDto) {
        return await this.authService.signIn(userLogin);
    }
}
