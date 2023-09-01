import { IsNotEmpty, IsString } from "class-validator";

export class NoteDto {
    @IsString()
    @IsNotEmpty()
    title: string

    @IsString()
    @IsNotEmpty()
    note: string;
}