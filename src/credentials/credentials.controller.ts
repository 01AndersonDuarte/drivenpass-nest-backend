import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CredentialDoc, CredentialDto } from './dto/credential.dto';
import { AuthGuard } from '../guards/auth.guard';
import { User as UserDecorator } from '../decorators/user.decorator';
import { User } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Credentials')
@ApiBearerAuth()
@Controller('credentials')
@UseGuards(AuthGuard)
export class CredentialsController {

    constructor(private readonly credentialService: CredentialsService) { }

    @Post('')
    @ApiOperation({ summary: 'Rota para criação de credenciais' })
    async createCredential(@Body() credential: CredentialDto, @UserDecorator() user: User) {
        return this.credentialService.createCredential(user, credential);
    }

    @Get('')
    @ApiOperation({ summary: 'Retorna todas as credenciais registradas por usuário', description: 'Aplicando query retorna apenas um dado' })
    @ApiQuery({ name: 'id', description: 'O id específico de um item registrado', example: 1, })
    @ApiResponse({ type: [CredentialDoc] })
    async getCredential(
        @Query("id", new ParseIntPipe({ optional: true })) id: number = undefined,
        @UserDecorator() user: User
    ) {
        return this.credentialService.getCredentials(user, id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Deleta uma credencial por id do banco' })
    @ApiParam({ name: 'id', description: 'O id específico do item', example: 1, })
    async delCredential(
        @Param("id", new ParseIntPipe()) id: number,
        @UserDecorator() user: User
    ) {
        return await this.credentialService.delCredential(id, user);
    }
}
