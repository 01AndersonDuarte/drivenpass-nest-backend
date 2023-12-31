import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CredentialsModule } from './credentials/credentials.module';
import { NoteModule } from './note/note.module';
import { CardsModule } from './cards/cards.module';
import { EraseModule } from './erase/erase.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, CredentialsModule, NoteModule, CardsModule, EraseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
