import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class EraseRepository {

    constructor(private readonly prisma: PrismaService) { }

    async deleteAccount(user: User) {
        await this.prisma.card.deleteMany({ where: { User: user } })
        await this.prisma.note.deleteMany({ where: { User: user } })
        await this.prisma.credential.deleteMany({ where: { User: user } })
        await this.prisma.user.deleteMany({ where: { id: user.id } })
    }
}