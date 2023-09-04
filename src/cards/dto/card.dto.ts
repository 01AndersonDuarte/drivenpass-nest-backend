import { ApiProperty } from "@nestjs/swagger";
import { CardType } from "@prisma/client";
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsNumberString, IsString, Length, Max, Min } from "class-validator";

export class CardDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "Card-Título 1", description: "Título para criação da pasta com suas informações" })
    title: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "Marcos S Oliveira", description: "Nome que consta no cartão" })
    name: string;
    
    @IsNumberString()
    @Length(13, 16)
    @IsNotEmpty()
    @ApiProperty({ example: "9999000011115555", description: "Número do cartão" })
    number: string;

    @IsNumberString()
    @Length(3, 3)
    @IsNotEmpty()
    @ApiProperty({ example: "111", description: "CVV de segurança do cartão" })
    code: string;

    @IsDateString()
    @IsNotEmpty()
    @ApiProperty({ example: "2027-12-12", description: "Data de vencimento do cartão" })
    date: Date;

    @IsNumberString()
    @Length(4, 4)
    @IsNotEmpty()
    @ApiProperty({ example: "0011", description: "Senha númerica de 4 digitos" })
    password: string;

    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({ example: false, description: "Valor booleano para informar se o cartão é virtual ou não" })
    virtual: boolean;

    @IsEnum(CardType)
    @IsNotEmpty()
    @ApiProperty({ enum: ['CREDIT', 'DEBIT', 'BOTH'], description: "Texto para representar o tipo do cartão."})

    // @ApiProperty({ example: "CREDIT", description: "Texto para representar o tipo do cartão. Podendo ser: CREDIT, DEBIT ou BOTH" })
    type: CardType;
}

export class CardDoc extends CardDto{
    @ApiProperty({ example: 1, description: "id do registro do cartão no banco"})
    id: number;
    @ApiProperty({ example: 1, description: "id do usuário a quem pertence o item"})
    userId: number;
}
