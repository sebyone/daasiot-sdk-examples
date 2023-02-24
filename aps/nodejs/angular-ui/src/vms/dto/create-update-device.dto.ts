import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class CreateUpdateDeviceDto {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  din: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  typeset: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  note: string;
}
