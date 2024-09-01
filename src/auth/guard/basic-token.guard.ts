import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const rawToken = request.headers['authorization'];

    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    const token = this.authService.extractToken(rawToken, false);
    const { userAccount, userPassword } =
      this.authService.decodeBasicToken(token);
    const user = await this.authService.authenticateAccountAndPassword({
      userAccount,
      userPassword,
    });

    request.user = user;

    return true;
  }
}
