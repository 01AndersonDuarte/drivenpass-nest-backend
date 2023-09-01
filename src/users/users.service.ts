import { ConflictException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {

    constructor(private readonly usersRepository: UsersRepository) { }

    async createUser(data: CreateUserDto) {
        const findUser = await this.getUserByEmail(data.email);
        if (findUser) throw new ConflictException("E-mail already registered.");

        return this.usersRepository.createUser(data);
    }

    async getUserByEmail(email: string){
        return await this.usersRepository.getUserByEmail(email);
    }

    async getById(id: number){
        return await this.usersRepository.getById(id);
    }
}
