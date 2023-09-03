import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CardsRepository } from './cards.repository';
import Cryptr from 'cryptr';
import { CardDto } from './dto/card.dto';
import { User } from '@prisma/client';

@Injectable()
export class CardsService {
    private readonly cryptr: Cryptr;

    constructor(private readonly cardsRepository: CardsRepository) {
        const Cryptr = require('cryptr');
        this.cryptr = new Cryptr(process.env.SECRET_CRYPTR);
    }

    async createCard(card: CardDto, user: User) {
        const { code, password, date } = card;
        await this.verifyTitle(card.title, user);
        const data = {
            ...card,
            date: new Date(date),
            code: this.cryptr.encrypt(code.toString()),
            password: this.cryptr.encrypt(password.toString())
        }

        return await this.cardsRepository.createCard(data, user);
    }

    async getCards(user: User, id: number) {
        if (id !== undefined) return await this.getCardById(id, user);

        return (await (this.cardsRepository.getCards(user)))
            .map(card => { return this.decryptCard(card) });
    }

    async delCard(id: number, user: User) {
        await this.getCardById(id, user);
        return this.cardsRepository.delCard(id);
    }

    async getCardById(id: number, user: User) {
        const card = await this.cardsRepository.getCardById(id);

        if (!card) throw new NotFoundException("Card not found.");
        if (card.userId !== user.id) throw new ForbiddenException("You do not have permission to access this resource.");

        return this.decryptCard(card);
    }

    private async verifyTitle(title: string, user: User) {
        const card = await this.cardsRepository.verifyTitle(title, user);
        if (card) throw new ConflictException("A card with this title already exists.");
    }

    private decryptCard(card: CardDto) {
        return {
            ...card,
            code: this.cryptr.decrypt(card.code),
            password: this.cryptr.decrypt(card.password)
        };
    }
}
