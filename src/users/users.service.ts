import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async register(userDto: RegisterDto) {
    const email = await this.usersRepository.findOneBy({
      email: userDto.email,
    });
    if (email) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }
    const newUser = new UserEntity();
    newUser.name = userDto.name;
    newUser.email = userDto.email;
    newUser.password = userDto.password;
    return await this.usersRepository.save(newUser);
  }

  async login(userDto: LoginDto): Promise<any> {
    const user = await this.usersRepository.findOneBy({ email: userDto.email });
    const password = await bcrypt.compare(
      userDto.password,
      user?.password ?? '',
    );
    if (!user || !password) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
    return this.loginResponse(user);
  }

  async findUserByIdEmail(id: number, email: string) {
    return await this.usersRepository.findOneByOrFail({ id, email });
  }

  /** Response login
   * @param user
   */
  private async loginResponse(user: UserEntity) {
    const payload = { sub: user.id, username: user.email };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
