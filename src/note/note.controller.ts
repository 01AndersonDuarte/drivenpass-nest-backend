import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteDoc, NoteDto } from './dto/note.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User as UserDecorator } from '../decorators/user.decorator';
import { User } from '@prisma/client';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Notes')
@Controller('notes')
@UseGuards(AuthGuard)
export class NoteController {
    constructor(private readonly noteService: NoteService) { }

    @Post('')
    @ApiOperation({ summary: 'Rota para criação de notas seguras' })
    async createNote(
        @Body() note: NoteDto,
        @UserDecorator() user: User
    ) {
        return this.noteService.createNote(note, user);
    }

    @Get('')
    @ApiOperation({ summary: 'Retorna todas as notas registradas por usuário', description: 'Aplicando query retorna apenas um dado' })
    @ApiQuery({ name: 'id', description: 'O id específico de um item registrado', example: 1, })
    @ApiResponse({ type: [NoteDoc] })
    async getNotes(
        @Query("id", new ParseIntPipe({ optional: true })) id: number = undefined,
        @UserDecorator() user: User
    ) {
        return await this.noteService.getNotes(user, id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Deleta uma nota por id do banco' })
    @ApiParam({ name: 'id', description: 'O id específico do item', example: 1, })
    async delCredential(
        @Param("id", new ParseIntPipe()) id: number,
        @UserDecorator() user: User
    ) {
        return await this.noteService.delNote(id, user);
    }
}


