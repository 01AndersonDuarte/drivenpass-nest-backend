import { Module } from '@nestjs/common';
import { EraseController } from './erase.controller';
import { EraseService } from './erase.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import {EraseRepository} from './erase.repository';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [EraseController],
  providers: [EraseService, EraseRepository]
})
export class EraseModule {}
