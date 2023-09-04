import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsUrl } from "class-validator";

export class CredentialDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "Credencial 1", description: "Título para armazenar sua credencial" })
    title: string

    @IsUrl()
    @IsNotEmpty()
    @ApiProperty({ example: "https://pt-br.facebook.com/login", description: "Url do site ao qual deseja guardar as credenciais" })
    url: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "marcos01@hotmail.com", description: "Credencial de login (username, email)." })
    username: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "S3nh@-M4is-S#guR4", description: "Sua senha do site" })
    password: string;
}

export class CredentialDoc extends CredentialDto {
    @ApiProperty({ example: 1, description: "id do registro no banco" })
    id: number;
    @ApiProperty({ example: 1, description: "id do usuário a quem pertence o item" })
    userId: number;
}