import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getUsers(): Promise<UserEntity[]> {
    const user = await this.userRepository.find();
    return user;
  }

  async getUserById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id }, relations: ['userProfile'] });
    if (!user) throw new NotFoundException(`계정이 존재하지 않습니다. ID : ${id}`);
    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.getUserById(id);
    const { userPassword, userPhone, userEmail, userProfile }: UpdateUserDto = updateUserDto;

    if (!(await bcrypt.compare(userPassword, user.userPassword))) throw new UnauthorizedException();

    userPhone && (user.userPhone = userPhone);
    userEmail && (user.userEmail = userEmail);
    userProfile && (user.userProfile = userProfile);

    this.userRepository.save(user);

    return user;
  }
}
