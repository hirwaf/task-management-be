import { IsDateString, IsOptional } from 'class-validator';
import { PriorityEnum } from '../tasks.entity';
import { Pagination } from "../../config/constants";

enum OrderEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

enum SortColumnEnum {
  isDone = 'isDone',
  createdAt = 'createdAt',
  title = 'title',
  priority = 'priority',
  start = 'start',
  end = 'end',
}
export class SearchParamDto {
  @IsOptional()
  title?: string;
  @IsOptional()
  priority?: PriorityEnum;
  @IsOptional()
  status?: boolean = false;
  @IsOptional()
  drafts?: boolean = false;
  @IsOptional()
  project?: number;
  @IsOptional()
  @IsDateString()
  start?: Date;
  @IsOptional()
  @IsDateString()
  end?: Date;
  @IsOptional()
  sortBy?: SortColumnEnum;
  @IsOptional()
  order?: OrderEnum;
  @IsOptional()
  page?: number;
  @IsOptional()
  limit?: number;
  @IsOptional()
  offset?: number;
}
