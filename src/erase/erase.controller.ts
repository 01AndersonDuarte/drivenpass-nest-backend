import { Body, Controller, Delete, UseGuards } from '@nestjs/common';
import { EraseService } from './erase.service';
import { User as UserDecorator } from '../decorators/user.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { User } from '@prisma/client';
import { EraseDto } from './dto/erase.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Erase')
@Controller('erase')
@UseGuards(AuthGuard)
export class EraseController {

    constructor(private readonly eraseService: EraseService) { }

    @Delete('')
    async deleteAccount(@Body() data: EraseDto, @UserDecorator() user: User) {
        await this.eraseService.deleteAccount(data, user);
        return 'Conta excluída!'
    }

}
