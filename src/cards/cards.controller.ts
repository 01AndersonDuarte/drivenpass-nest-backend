import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CardsService } from './cards.service';
import { AuthGuard } from '../guards/auth.guard';
import { User as UserDecorator } from '../decorators/user.decorator';
import { User } from '@prisma/client';
import { CardDto } from './dto/card.dto';

@Controller('cards')
@UseGuards(AuthGuard)
export class CardsController {
    
    constructor(private readonly cardsService: CardsService) { }

    @Post('')
    async createNote(
        @Body() note: CardDto,
        @UserDecorator() user: User
    ) {
        return this.cardsService.createCard(note, user);
    }

    @Get('')
    async getCards(
        @Query("id", new ParseIntPipe({ optional: true })) id: number = undefined,
        @UserDecorator() user: User
    ) {
        return await this.cardsService.getCards(user, id);
    }

    @Delete(':id')
    async delCard(
        @Param("id", new ParseIntPipe()) id: number,
        @UserDecorator() user: User
    ) {
        return await this.cardsService.delCard(id, user);
    }
}
