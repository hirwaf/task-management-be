import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PriorityEnum } from '../tasks.entity';

export class CreateDto {
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsOptional()
  @MaxLength(100)
  description?: string;
  @IsOptional()
  priority: PriorityEnum;
  @IsOptional()
  @IsDateString()
  start?: Date;
  @IsOptional()
  @IsDateString()
  end?: Date;
  @IsNotEmpty()
  isDraft: boolean;
  @IsOptional()
  assignees?: number[];
  @IsOptional()
  projects?: number[];
}
