import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    private EXPIRATION_TIME = "3 days";
    private ISSUER = "DrivenPass";
    private AUDIENCE = "users";

    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService) { }

    async signUp(data: SignUpDto) {
        return this.usersService.createUser(data);
    }

    async signIn(data: SignInDto) {
        const { email, password } = data;
        const user = await this.usersService.getUserByEmail(email);
        if (!user) throw new UnauthorizedException("Something is wrong.");

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new UnauthorizedException("Something is wrong.");

        return this.createToken(user);
    }

    createToken(user: User) {
        const { id, email } = user;

        const token = this.jwtService.sign({ email }, {
            expiresIn: this.EXPIRATION_TIME,
            subject: String(id),
            issuer: this.ISSUER,
            audience: this.AUDIENCE
        })

        return { token };
    }

    checkToken(token: string) {
        const data = this.jwtService.verify(token, {
            audience: this.AUDIENCE,
            issuer: this.ISSUER
        });

        return data;
    }
}
