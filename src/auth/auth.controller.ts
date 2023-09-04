import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('/sign-up')
    @ApiOperation({ summary: "Realiza cadastro de novos usuários no sistema" })
    @ApiBody({type: CreateUserDto})
    async signUp(@Body() newUser: SignUpDto) {
        return await this.authService.signUp(newUser);
    }

    @Post('/sign-in')
    @ApiOperation({ summary: "Rota de login para usuários cadastrados" })
    @ApiBody({type: CreateUserDto})
    @HttpCode(HttpStatus.OK)
    async signIn(@Body() userLogin: SignInDto) {
        return await this.authService.signIn(userLogin);
    }
}
