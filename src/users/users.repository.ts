import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersRepository {
    private CRYPT = 10;
    
    constructor(private readonly prisma: PrismaService) { }
    
    async getUserByEmail(email: string) {
        return await this.prisma.user.findUnique({ where: { email } });
    }
   
    async getById(id: number) {
        return await this.prisma.user.findUnique({ where: { id } });
    }
   
    async createUser(data: CreateUserDto) {
        return await this.prisma.user.create({
            data: {
                email: data.email,
                password: bcrypt.hashSync(data.password, this.CRYPT)
            }
        });
    }
}
