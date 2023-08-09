import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  async register(@Body() userDto: RegisterDto) {
    return await this.usersService.register(userDto);
  }

  @Post('/auth/login')
  async login(@Body() userDto: LoginDto) {
    return await this.usersService.login(userDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(AuthGuard)
  @Get('/all')
  getAllUsers(@Request() req) {
    return this.usersService.findAllUsers(req.user.id);
  }
}
