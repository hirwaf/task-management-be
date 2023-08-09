import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';

export enum PriorityEnum {
  High = 'High',
  Normal = 'Normal',
  Low = 'Low',
}

@Entity('tasks')
export class TasksEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    type: 'longtext',
    nullable: true,
  })
  description?: string;

  @Column({
    type: 'enum',
    enum: PriorityEnum,
    default: PriorityEnum.Normal,
  })
  priority: PriorityEnum;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  start?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  end?: Date;

  @Column({ default: false })
  isDraft: boolean;

  @Column({ default: false })
  isDone: boolean;

  @ManyToOne(() => UserEntity, (user) => user.tasks)
  user: UserEntity;

  @OneToMany(() => AttachmentEntity, (attachment) => attachment.task)
  attachments: AttachmentEntity[];

  @ManyToMany(() => UserEntity)
  @JoinTable()
  assignees: UserEntity[];

  @ManyToMany(() => ProjectEntity)
  @JoinTable()
  projects: ProjectEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}

@Entity('attachments')
export class AttachmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  filePath: string;

  @ManyToOne(() => TasksEntity, (task) => task.attachments)
  task: TasksEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}

@Entity('projects')
export class ProjectEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
