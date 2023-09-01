import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { NoteRepository } from './note.repository';
import { NoteDto } from './dto/note.dto';
import { User } from '@prisma/client';
import Cryptr from 'cryptr';

@Injectable()
export class NoteService {
    private readonly cryptr: Cryptr;       

    constructor(private readonly noteRepository: NoteRepository) {
        const Cryptr = require('cryptr');
        this.cryptr = new Cryptr(process.env.SECRET_CRYPTR);
    }

    async createNote(note: NoteDto, user: User) {
        await this.verifyTitle(note.title, user);
        const data = { ...note, note: this.cryptr.encrypt(note.note) }

        return await this.noteRepository.createNote(data, user);
    }

    async getNotes(user: User, id: number) {
        if(id!==undefined) return await this.getNoteById(id, user);
        
        return (await (this.noteRepository.getNotes(user)))
        .map(note => { return this.decryptNote(note)});
    }

    async delNote(id: number, user: User) {
        await this.getNoteById(id, user);
        return this.noteRepository.delNote(id);
    }
    
    async getNoteById(id: number, user: User){
        const note = await this.noteRepository.getNoteById(id);

        if(!note) throw new NotFoundException("Note not found.");
        if(note.userId !== user.id) throw new ForbiddenException("You do not have permission to access this resource.");
        
        return this.decryptNote(note);
    }

    private async verifyTitle(title: string, user: User) {
        const note = await this.noteRepository.verifyTitle(title, user);
        if (note) throw new ConflictException("A note with this title already exists.");
    }

    private decryptNote(note: NoteDto){
        return {...note, note: this.cryptr.decrypt(note.note)};
    }
}
