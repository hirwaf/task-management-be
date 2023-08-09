import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../users/auth.guard';
import { TasksService } from './tasks.service';
import { TasksEntity } from './tasks.entity';
import { CreateDto } from './dto/create.dto';

@UseGuards(AuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}
  @Get('/')
  async getTasks(@Request() req): Promise<TasksEntity[]> {
    const user = req.user;
    return this.tasksService.getTasks(user);
  }
  @Get('/:id')
  async getTask(@Request() req, @Param('id') id: number): Promise<TasksEntity> {
    return this.tasksService.getOneTask(req.user, id);
  }
  @Post('/')
  async createTask(
    @Request() req,
    @Body() task: CreateDto,
  ): Promise<TasksEntity> {
    return this.tasksService.createTask(req.user, task);
  }
}
