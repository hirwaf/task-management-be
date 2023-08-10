import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '../users/auth.guard';
import { TasksService } from './tasks.service';
import { TasksEntity } from './tasks.entity';
import { CreateDto } from './dto/create.dto';
import { SearchParamDto } from './dto/search-param.dto';
import { PageDto } from './dto/page.dto';
import { ExportService } from '../export/export.service';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { EditFileName, fileFilter } from '../helpers/multer';
import { FileUpload } from '../config/constants';
import { diskStorage } from 'multer';

@UseGuards(AuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(
    private tasksService: TasksService,
    private exportService: ExportService,
  ) {}
  @Get('/')
  async getTasks(
    @Request() req,
    @Query() query: SearchParamDto,
  ): Promise<PageDto> {
    const user = req.user;
    return await this.tasksService.getTasks(user, query);
  }

  @Get('/stats')
  async getStats(@Request() req) {
    const user = req.user;
    return await this.tasksService.getStatistics(user);
  }

  @Get('/excel-export')
  async exportTasks(
    @Request() req,
    @Res() res: Response,
    @Query() query: SearchParamDto,
  ) {
    const user = req.user;
    const file = await this.exportService.exportExcel(user, query);
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return res.download(file);
  }
  @Get('/projects/list')
  async projects(@Request() req) {
    return this.tasksService.getProjects();
  }
  @Get('/:id')
  async getTask(@Request() req, @Param('id') id: number): Promise<TasksEntity> {
    return this.tasksService.getOneTask(req.user, id);
  }
  @Post('/')
  @UseInterceptors(
    FilesInterceptor('attachments', FileUpload.maxFiles, {
      storage: diskStorage({
        destination: './attachments',
        filename: EditFileName,
      }),
      fileFilter,
    }),
  ) // 'files' is the field name
  async createTask(
    @Request() req,
    @Body() task: CreateDto,
    @UploadedFiles() attachments?: Array<Express.Multer.File>,
  ): Promise<TasksEntity> {
    // console.log(attachments);
    return this.tasksService.createTask(req.user, task, attachments);
  }
  @Patch('/:id')
  async updateTask(
    @Request() req,
    @Param('id') id: number,
    @Body() task: CreateDto,
    @UploadedFiles() attachments?: Array<Express.Multer.File>,
  ): Promise<TasksEntity> {
    return this.tasksService.updateTask(req.user, id, task, attachments);
  }
  @Delete('/:id')
  async deleteTask(@Request() req, @Param('id') id: number) {
    return this.tasksService.deleteTask(req.user, id);
  }
}
