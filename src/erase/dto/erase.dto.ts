import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class EraseDto{
    @IsString()
    @IsStrongPassword()
    @IsNotEmpty()
    password: string;
}