import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../users/user.entity';
import { Repository } from 'typeorm';
import { TasksEntity } from '../tasks/tasks.entity';
import { SearchParamDto } from '../tasks/dto/search-param.dto';
import { Pagination } from '../config/constants';
import ExcelJS from 'exceljs';
import * as path from 'path';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(TasksEntity)
    private tasksRepository: Repository<TasksEntity>,
  ) {}

  /**
   * Exporting data to Excel
   * @param user
   * @param params
   */
  async exportExcel(user: UserEntity, params: SearchParamDto): Promise<string> {
    const query = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoin('task.projects', 'project')
      .leftJoin('task.assignees', 'assignees')
      .loadRelationCountAndMap(
        'task.total_attachments',
        'task.attachments',
        'total_attachments',
      )
      .where('task.userId = :userId', { userId: user.id })
      .andWhere('task.isDraft = :isDraft', { isDraft: params.drafts });
    // Query parameters for filtering
    if (params.title) {
      query.andWhere('task.title LIKE :title', { title: `%${params.title}%` });
    }
    if (params.priority) {
      query.andWhere('task.priority = :priority', {
        priority: params.priority,
      });
    }
    if (params.status) {
      query.andWhere('task.isDone = :isDone', { isDone: params.status });
    }
    if (params.project) {
      query.andWhere('project.id = :projectId', { projectId: params.project });
    }
    if (params.start) {
      query.andWhere('task.start >= :start', { start: params.start });
    }
    if (params.end) {
      query.andWhere('task.end <= :end', { end: params.end });
    }

    // Sorting
    if (params.sortBy && params.order) {
      query.orderBy(`task.${params.sortBy}`, params.order);
    } else {
      // Default sorting
      query.orderBy('task.isDone', 'ASC').addOrderBy('task.createdAt', 'DESC');
    }
    query.take(params.limit ?? Pagination.defaultPage);
    const skip =
      ((params.page ?? Pagination.defaultPage) - 1) *
      (params.limit ?? Pagination.defaultPage);
    query.skip(skip);
    const itemCount = await query.getCount();
    const entities = await query.getMany();
    if (itemCount <= 0) {
      throw new NotFoundException();
    }
    const excel = new ExcelJS.Workbook();
    const sheet = excel.addWorksheet('Tasks');
    const rows = [];
    entities.map((entity) => {
      rows.push(Object.values(entity));
    });
    rows.unshift(Object.keys(entities[0]));
    sheet.addRows(rows);
    const exportPath = path.resolve(__dirname, 'tasks.xlsx');
    await excel.xlsx.writeFile(exportPath);

    return exportPath;
  }
}
