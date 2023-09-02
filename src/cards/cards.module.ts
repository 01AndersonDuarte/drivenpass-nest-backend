import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { CardsRepository } from './cards.repository';

@Module({
  imports: [PrismaModule, UsersModule],
  providers: [CardsService, CardsRepository],
  controllers: [CardsController]
})
export class CardsModule {}
