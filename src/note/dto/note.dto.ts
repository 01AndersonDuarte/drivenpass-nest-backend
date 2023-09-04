import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class NoteDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "Minha Primeira Nota", description: "O título ao qual quer impor à sua nota" })
    title: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "Lembrar de ir ao mercado no fim de semana", description: "Suas anotações pessoais" })
    note: string;
}

export class NoteDoc extends NoteDto {
    @ApiProperty({ example: 1, description: "id do registro no banco" })
    id: number;
    @ApiProperty({ example: 1, description: "id do usuário a quem pertence o item" })
    userId: number;
}