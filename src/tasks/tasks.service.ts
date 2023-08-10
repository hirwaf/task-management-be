import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../users/user.entity';
import { In, Repository } from 'typeorm';
import {
  AttachmentEntity,
  PriorityEnum,
  ProjectEntity,
  TasksEntity,
} from './tasks.entity';
import { CreateDto } from './dto/create.dto';
import { SearchParamDto } from './dto/search-param.dto';
import { PageDto } from './dto/page.dto';
import { Pagination } from '../config/constants';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(TasksEntity)
    private tasksRepository: Repository<TasksEntity>,
    @InjectRepository(ProjectEntity)
    private projectsRepository: Repository<ProjectEntity>,
    @InjectRepository(AttachmentEntity)
    private attachmentRepository: Repository<AttachmentEntity>,
  ) {}

  /**
   * Get users tasks
   * @param user
   * @param params
   */
  async getTasks(user: UserEntity, params: SearchParamDto) {
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
    const { entities } = await query.getRawAndEntities();
    return new PageDto({
      page: params.page ?? Pagination.defaultPage,
      take: params.limit ?? Pagination.defaultLimit,
      itemCount,
      entities,
    });
  }

  /**
   * Get stats
   * @param user
   */
  async getStatistics(user: UserEntity) {
    const query = this.tasksRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId: user.id });
    const totalCount = await query.getCount();
    const completedCount = await query
      .where('task.isDone = :status', { status: true })
      .getCount();
    const notCompletedCount = await query
      .where('task.isDone = :status', { status: false })
      .getCount();
    const draftCount = await query
      .where('task.isDraft = :isDraft', { isDraft: true }) // assuming draft is a boolean
      .getCount();

    return {
      totalCount: totalCount,
      completedCount: completedCount,
      notCompletedCount: notCompletedCount,
      draftCount: draftCount,
    };
  }

  /**
   * Get Single Task
   * @param user
   * @param id
   */
  async getOneTask(user: UserEntity, id: number) {
    return this.tasksRepository
      .createQueryBuilder('task')
      .where('task.id = :task', { task: id })
      .where('task.userId = :userId', { userId: user.id })
      .getOne();
  }

  /**
   * Get Drafted tasks
   * @param user
   */
  async getDraftTasks(user: UserEntity) {
    return user.tasks.filter((task) => task.isDraft === true);
  }

  /**
   * Get Done tasks
   * @param user
   */
  async getDoneTasks(user: UserEntity) {
    return user.tasks.filter((task) => task.isDone === true);
  }

  /**
   * Get Projects
   */
  async getProjects() {
    return this.projectsRepository.createQueryBuilder('project').getMany();
  }

  /**
   * Create a Task
   * @param user
   * @param task
   * @param attachments
   */
  async createTask(
    user,
    task: CreateDto,
    attachments: Array<Express.Multer.File>,
  ) {
    const newTask = new TasksEntity(task);
    newTask.assignees = await this.usersRepository.findBy({
      id: In(task.assignees || []),
    });
    newTask.projects = await this.projectsRepository.findBy({
      id: In(task.projects || []),
    });
    const savedTask = await this.tasksRepository.manager.save(newTask);

    if (attachments) {
      await Promise.all(
        attachments.map((file) => {
          this.saveAttachment(<AttachmentEntity>{
            name: file.originalname,
            filePath: file.path,
            task: savedTask,
          });
        }),
      );
    }

    return savedTask;
  }

  /**
   * Update task
   *
   * @param user
   * @param id
   * @param task
   * @param attachments
   */
  async updateTask(
    user,
    id: number,
    task: CreateDto,
    attachments: Array<Express.Multer.File>,
  ) {
    const entity = new TasksEntity(task);
    const updateTask = await this.tasksRepository.update(
      { id: id, user: user },
      entity,
    );
    if (updateTask.affected == 1) {
      const task_ = await this.tasksRepository.findOneBy({ id });
      if (attachments) {
        await Promise.all(
          attachments.map((file) => {
            this.saveAttachment(<AttachmentEntity>{
              name: file.originalname,
              filePath: file.path,
              task: task_,
            });
          }),
        );
      }
      return task_;
    }
    throw new BadRequestException();
  }

  /**
   * Delete Tasks
   * @param user
   * @param taskId
   */
  async deleteTask(user, taskId: number) {
    this.tasksRepository
      .createQueryBuilder('task')
      .where('task.id = :task', { task: taskId })
      .where('task.userId = :userId', { userId: user.id })
      .softDelete();

    return;
  }

  async saveAttachment(
    attachment: AttachmentEntity,
  ): Promise<AttachmentEntity> {
    const file = this.attachmentRepository.create(attachment);
    return this.attachmentRepository.save(file);
  }

  async associateAttachmentWithTask(
    taskId: number,
    attachmentId: number,
  ): Promise<void> {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
      relations: ['attachments'],
    });
    const file = await this.attachmentRepository.findOne({
      where: { id: attachmentId },
    });
    task.attachments.push(file);
    await this.tasksRepository.save(task);
  }
}
