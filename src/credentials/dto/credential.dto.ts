import { IsNotEmpty, IsNumber, IsString, IsUrl } from "class-validator";

export class CredentialDto {
    @IsString()
    @IsNotEmpty()
    title: string

    @IsUrl()
    @IsNotEmpty()
    url: string;

    @IsString()
    @IsNotEmpty()
    username: string;
    
    @IsString()
    @IsNotEmpty()
    password: string;
}