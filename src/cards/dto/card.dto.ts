import { CardType } from "@prisma/client";
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsNumberString, IsString, Length, Max, Min } from "class-validator";

export class CardDto {
    @IsString()
    @IsNotEmpty()
    title: string

    @IsString()
    @IsNotEmpty()
    name: string;
    
    @IsNumberString()
    @Length(13, 16)
    @IsNotEmpty()
    number: string;

    @IsNumberString()
    @Length(3, 3)
    @IsNotEmpty()
    code: string;

    @IsDateString()
    @IsNotEmpty()
    date: Date;

    @IsNumberString()
    @Length(4, 4)
    @IsNotEmpty()
    password: string;

    @IsBoolean()
    @IsNotEmpty()
    virtual: boolean;

    @IsEnum(CardType)
    @IsNotEmpty()
    type: CardType;
}
