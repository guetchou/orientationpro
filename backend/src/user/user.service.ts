
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findOne({ 
      where: { email: createUserDto.email }
    });
    
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }
    
    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // Créer et sauvegarder le nouvel utilisateur
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { email }
    });
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    
    return user;
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { id }
    });
    
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    
    return user;
  }

  async getUserTestHistory(userId: number) {
    // Cette méthode sera implémentée quand le module TestResults sera disponible
    // Pour l'instant, nous retournons un tableau vide
    return [];
  }
}
