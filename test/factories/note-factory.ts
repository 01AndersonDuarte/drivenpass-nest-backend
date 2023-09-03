import { faker } from "@faker-js/faker";
import { PrismaService } from "../../src/prisma/prisma.service";
import { User } from "@prisma/client";
import Cryptr from "cryptr";
import { NoteDto } from "../../src/note/dto/note.dto";

export class NoteFactory {
    private readonly cryptr: Cryptr;

    private title: string;
    private note: string;

    constructor(private readonly prisma: PrismaService) {
        const Cryptr = require('cryptr');
        this.cryptr = new Cryptr(process.env.SECRET_CRYPTR);
    }


    build(): NoteDto {
        return {
            title: this.title,
            note: this.note,
        }
    }

    randomBuild() {
        this.title = faker.lorem.text();
        this.note = faker.lorem.text();
       
        return this.build();
    }

    async persist(user: User){
        const note = this.randomBuild();
        const response = await this.prisma.note.create({
            data: { 
                ...note, 
                note: this.cryptr.encrypt(note.note),
                User: { connect: user }                
            }
        })
        return {...response, note: this.cryptr.decrypt(response.note)}
    }
}