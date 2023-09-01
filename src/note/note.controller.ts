import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteDto } from './dto/note.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User as UserDecorator } from '../decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('notes')
@UseGuards(AuthGuard)
export class NoteController {
    constructor(private readonly noteService: NoteService) { }

    @Post('')
    async createNote(
        @Body() note: NoteDto,
        @UserDecorator() user: User
    ) {
        return this.noteService.createNote(note, user);
    }

    @Get('')
    async getNotes(
        @Query("id", new ParseIntPipe({ optional: true })) id: number = undefined,
        @UserDecorator() user: User
    ) {
        return await this.noteService.getNotes(user, id);
    }

    @Delete(':id')
    async delCredential(
        @Param("id", new ParseIntPipe()) id: number,
        @UserDecorator() user: User
    ) {
        return await this.noteService.delNote(id, user);
    }
}


