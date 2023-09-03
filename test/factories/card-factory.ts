import { faker } from "@faker-js/faker";
import { PrismaService } from "../../src/prisma/prisma.service";
import { User } from "@prisma/client";
import Cryptr from "cryptr";
import { CardDto } from "../../src/cards/dto/card.dto";
import { CardType } from "@prisma/client";
export class CardFactory {
    private readonly cryptr: Cryptr;

    private title: string;
    private number: string;
    private name: string;
    private code: string;
    private date: Date;
    private password: string;
    private virtual: boolean;
    private type: CardType;

    constructor(private readonly prisma: PrismaService) {
        const Cryptr = require('cryptr');
        this.cryptr = new Cryptr(process.env.SECRET_CRYPTR);
    }


    build(): CardDto {
        return {
            title: this.title,
            name: this.name,
            number: this.number,
            code: this.code,
            date: this.date,
            password: this.password,
            virtual: this.virtual,
            type: this.type
        }
    }

    randomBuild() {
        this.title = faker.lorem.words();
        this.name = faker.person.firstName();
        this.number = faker.finance.creditCardNumber('65[1-9]############L');
        this.code = faker.finance.creditCardCVV();
        this.date = faker.date.future();
        this.password = faker.number.bigInt({ min: 1000, max: 9999 }).toString();
        this.virtual = faker.datatype.boolean();
        this.type = this.type = "CREDIT";

        return this.build();
    }

    async persist(user: User) {
        const card = this.randomBuild();
        const response = await this.prisma.card.create({
            data: {
                ...card,
                code: this.cryptr.encrypt(card.code.toString()),
                password: this.cryptr.encrypt(card.password.toString()),
                User: { connect: user }
            }
        })
        return {
            ...response,
            code: this.cryptr.decrypt(response.code),
            password: this.cryptr.decrypt(response.password)
        }
    }
}