import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class CreateUpdateVmsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  iot: boolean;

  @ApiProperty()
  @ValidateIf((o) => o.iot)
  @IsString()
  @IsNotEmpty()
  vmsUri: string;

  @ApiProperty()
  @ValidateIf((o) => o.iot)
  @IsNumber()
  @IsNotEmpty()
  vmsPort: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  note: string;
}
