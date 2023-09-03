import { faker } from "@faker-js/faker";
import { PrismaService } from "../../src/prisma/prisma.service";
import { Credential, User } from "@prisma/client";
import Cryptr from "cryptr";
import { CredentialDto } from "../../src/credentials/dto/credential.dto";

export class CredentialFactory {
    private readonly cryptr: Cryptr;

    private title: string;
    private url: string;
    private username: string;
    private password: string;

    constructor(private readonly prisma: PrismaService) {
        const Cryptr = require('cryptr');
        this.cryptr = new Cryptr(process.env.SECRET_CRYPTR);
    }


    build(): CredentialDto {
        return {
            title: this.title,
            url: this.url,
            username: this.username,
            password: this.password,
        }
    }

    randomBuild() {
        this.title = faker.lorem.text();
        this.url = faker.internet.url();
        this.username = faker.internet.userName();
        this.password = faker.internet.password();
        return this.build();
    }

    async persist(user: User){
        const credential = this.randomBuild();
        const response = await this.prisma.credential.create({
            data: { 
                ...credential, 
                password: this.cryptr.encrypt(credential.password),
                User: { connect: user }                
            }
        })
        return {...response, password: this.cryptr.decrypt(response.password)}
    }
}