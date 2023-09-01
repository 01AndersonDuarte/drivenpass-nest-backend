import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';

@Global()
@Module({
  imports: [JwtModule.register({
    secret: process.env.JWT_SECRET
  }), UsersModule],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule { }
