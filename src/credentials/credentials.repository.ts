import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CredentialDto } from './dto/credential.dto';
import { User } from '@prisma/client';

@Injectable()
export class CredentialsRepository {

    constructor(private readonly prisma: PrismaService) { }

    async createCredential(user: User, credential: CredentialDto) {
        return await this.prisma.credential.create({ data: { ...credential, User: { connect: user } } });
    }

    async verifyTitle(title: string, user: User) {
        return await this.prisma.credential.findFirst({ where: { title: title, User: user } })
    }

    async getCredentials(user: User) {
        return this.prisma.credential.findMany({
            where: { User: user },
            select: {
                id: true,
                title: true,
                url: true,
                username: true,
                password: true
            }
        })
    }

    async getCredentialById(id: number) {
        return await this.prisma.credential.findFirst({
            where: { id },
            select: {
                id: true,
                title: true,
                url: true,
                username: true,
                password: true,
                userId: true
            }
        });
    }

    async delCredential(id: number) {
        await this.prisma.credential.delete({ where: { id } });
    }
}
