import { Injectable, UnauthorizedException } from '@nestjs/common';
import { EraseRepository } from './erase.repository';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { EraseDto } from './dto/erase.dto';

@Injectable()
export class EraseService {

    constructor(private readonly eraseRepository: EraseRepository) { }

    async deleteAccount(data: EraseDto, user: User) {
        const { password } = data;
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new UnauthorizedException("Invalid password.");

        return await this.eraseRepository.deleteAccount(user);
    }
}
