
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto, LoginUserDto, UserResponseDto } from '../user/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.create(createUserDto);
    
    const token = this.jwtService.sign({ 
      userId: user.id, 
      email: user.email,
      role: user.role 
    });
    
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      token,
    };
  }

  async login(loginUserDto: LoginUserDto): Promise<UserResponseDto> {
    const user = await this.validateUser(loginUserDto.email, loginUserDto.password);
    
    const token = this.jwtService.sign({ 
      userId: user.id, 
      email: user.email,
      role: user.role 
    });
    
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      token,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findByEmail(email);
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }
      
      return user;
    } catch (error) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
  }
}
