import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CredentialDto } from './dto/credential.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User as UserDecorator } from '../decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('credentials')
@UseGuards(AuthGuard)
export class CredentialsController {

    constructor(private readonly credentialService: CredentialsService) { }

    @Post('')
    async createCredential(@Body() credential: CredentialDto, @UserDecorator() user: User) {
        return this.credentialService.createCredential(user, credential);
    }

    @Get('')
    async getCredential(
        @Query("id", new ParseIntPipe({ optional: true })) id: number = undefined,
        @UserDecorator() user: User
    ) {
        return this.credentialService.getCredentials(user, id);
    }

    @Delete(':id')
    async delCredential(
        @Param("id", new ParseIntPipe()) id: number,
        @UserDecorator() user: User
    ) {
        return await this.credentialService.delCredential(id, user);
    }
}
