import { CreateUserDto } from "../../src/users/dto/create-user.dto";
import { PrismaService } from "../../src/prisma/prisma.service";
import { faker } from '@faker-js/faker';
import * as bcrypt from "bcrypt";

import { User } from "@prisma/client";

export class UsersFactory {
    private email: string;
    private password: string;

    constructor(private readonly prisma: PrismaService) { }

    setEmail(email: string) {
        this.email = email;
        return this;
    }

    setPassword(password: string) {
        this.password = password;
        return this;
    }

    build(): CreateUserDto {
        return {
            email: this.email,
            password: this.password
        }
    }

    async randomBuild(persist: boolean = false){
        this.setEmail(faker.internet.email());
        this.setPassword("P4s2word-2tR0ng");
        if(persist) await this.persist();
        return this.build();
    }

    async persist() {
        const user = this.build();
        return await this.prisma.user.create({ data: {...user, password: bcrypt.hashSync(user.password, 10)} });
    }
}