import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../users/user.entity';
import { In, Repository } from 'typeorm';
import { AttachmentEntity, ProjectEntity, TasksEntity } from './tasks.entity';
import { CreateDto } from './dto/create.dto';

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
   */
  async getTasks(user: UserEntity) {
    return user.tasks;
  }

  /**
   * Get Single Task
   * @param user
   * @param id
   */
  async getOneTask(user: UserEntity, id: number) {
    return user.tasks.find((task) => task.id === id);
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
    return this.projectsRepository.find();
  }

  /**
   * Create a Task
   * @param user
   * @param task
   */
  async createTask(user, task: CreateDto) {
    const newTask = new TasksEntity();
    newTask.title = task.title;
    newTask.description = task.description;
    newTask.priority = task.priority;
    newTask.start = task.start;
    newTask.end = task.end;
    newTask.isDraft = task.isDraft;
    newTask.isDone = false;
    newTask.user = user;
    newTask.attachments = null;
    newTask.assignees = await this.usersRepository.findBy({
      id: In(task.assignees || []),
    });
    newTask.projects = await this.projectsRepository.findBy({
      id: In(task.projects || []),
    });
    newTask.createdAt = new Date();
    newTask.updatedAt = new Date();
    newTask.deletedAt = null;
    return this.tasksRepository.manager.save(newTask);
  }
}
