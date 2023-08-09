import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/user.entity';
import { AttachmentEntity, ProjectEntity, TasksEntity } from './tasks.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { UsersService } from '../users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      TasksEntity,
      AttachmentEntity,
      ProjectEntity,
    ]),
  ],
  providers: [TasksService, UsersService],
  controllers: [TasksController],
})
export class TasksModule {}
