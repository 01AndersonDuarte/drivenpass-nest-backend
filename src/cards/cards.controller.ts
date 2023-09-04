import { Body, Controller, Delete, Get, Optional, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CardsService } from './cards.service';
import { AuthGuard } from '../guards/auth.guard';
import { User as UserDecorator } from '../decorators/user.decorator';
import { User } from '@prisma/client';
import { CardDoc, CardDto } from './dto/card.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, PickType, getSchemaPath, } from '@nestjs/swagger';

@ApiTags('Cards')
@ApiBearerAuth()
@Controller('cards')
@UseGuards(AuthGuard)
export class CardsController {

    constructor(private readonly cardsService: CardsService) { }

    @Post('')
    @ApiOperation({ summary: 'Rota para armazenar dados de cartões' })
    async createCard(
        @Body() note: CardDto,
        @UserDecorator() user: User
    ) {
        return this.cardsService.createCard(note, user);
    }

    @Get('')
    @ApiOperation({ summary: 'Retorna todos os cartões registrados por usuário', description: 'Aplicando query retorna apenas um dado' })
    @ApiQuery({ name: 'id', description: 'O id específico de um cartão registrado', example: 1, })
    @ApiResponse({ type: [CardDoc] })
    async getCards(
        @Query("id", new ParseIntPipe({ optional: true })) id: number = undefined,
        @UserDecorator() user: User
    ) {
        return await this.cardsService.getCards(user, id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Deleta um registro de cartão do banco' })
    @ApiParam({ name: 'id', description: 'O id específico de um cartão registrado', example: 1, })
    async delCard(
        @Param("id", new ParseIntPipe()) id: number,
        @UserDecorator() user: User
    ) {
        return await this.cardsService.delCard(id, user);
    }
}
