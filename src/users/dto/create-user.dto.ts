import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator";

export class CreateUserDto{
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ example: "anderson@gmail.com", description: "Email de usuário para cadastro" })
    email: string;

    @IsStrongPassword()
    @IsNotEmpty()
    @ApiProperty({ example: "S3nh@-f0rTe!", description: "Senha para o usuário" })
    password: string;
}