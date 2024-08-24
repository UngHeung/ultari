import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user-entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserSignupDto } from './dto/user-signup.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async createUser(userSignupDto: UserSignupDto): Promise<void> {
    // userSignupDto.userPassword = 'bcypt'
    const user = this.userRepository.create(userSignupDto);

    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505')
        throw new ConflictException('이미 등록된 계정입니다.');
      else throw new InternalServerErrorException();
    }
  }
}
