import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CardDto } from './dto/card.dto';

@Injectable()
export class CardsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createCard(card: CardDto, user: User) {
        return await this.prisma.card.create({ data: { ...card, User: { connect: user } } });
    }

    async getCards(user: User) {
        return this.prisma.card.findMany({
            where: { User: user }
        })
    }

    async getCardById(id: number) {
        return await this.prisma.card.findFirst({
            where: { id }
        })
    }

    async verifyTitle(title: string, user: User) {
        return await this.prisma.card.findFirst({ where: { title: title, User: user } })
    }

    async delCard(id: number) {
        await this.prisma.card.delete({ where: { id } });
    }
}
