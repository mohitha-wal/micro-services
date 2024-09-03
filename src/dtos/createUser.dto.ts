import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class createUserDto{
    @IsString()
    @IsNotEmpty()
    name:string;

    @IsNumber()
    @IsNotEmpty()
    age:number;

}