import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NoteDto } from './dto/note.dto';
import { User } from '@prisma/client';

@Injectable()
export class NoteRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createNote(note: NoteDto, user: User) {
        return this.prisma.note.create({ data: { ...note, User: { connect: user } } });
    }

    async getNotes(user: User) {
        return this.prisma.note.findMany({
            where: { User: user },
            select: {
                title: true,
                note: true
            }
        })
    }

    async getNoteById(id: number) {
        return await this.prisma.note.findFirst({
            where: { id },
            select: {
                title: true,
                note: true,
                userId: true,
            }
        })
    }

    async verifyTitle(title: string, user: User) {
        return await this.prisma.note.findFirst({ where: { title: title, User: user } })
    }

    async delNote(id: number) {
        await this.prisma.note.delete({ where: { id } });
    }
}
