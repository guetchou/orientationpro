
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestResult } from './test-results.entity';
import { CreateTestResultDto } from './test-results.dto';

@Injectable()
export class TestResultsService {
  constructor(
    @InjectRepository(TestResult)
    private testResultsRepository: Repository<TestResult>,
  ) {}

  async create(createTestResultDto: CreateTestResultDto): Promise<TestResult> {
    // Assurer que les résultats incluent un score de confiance
    if (createTestResultDto.results && !createTestResultDto.results.confidenceScore) {
      if (createTestResultDto.confidence_score) {
        // Si le DTO a un confidence_score, l'utiliser dans les résultats
        createTestResultDto.results.confidenceScore = createTestResultDto.confidence_score;
      } else {
        // Sinon, utiliser une valeur par défaut
        createTestResultDto.results.confidenceScore = 85;
      }
    }
    
    const testResult = this.testResultsRepository.create(createTestResultDto);
    return this.testResultsRepository.save(testResult);
  }

  async findByUserId(userId: number): Promise<TestResult[]> {
    return this.testResultsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' }
    });
  }

  async findById(id: number): Promise<TestResult> {
    const testResult = await this.testResultsRepository.findOne({ where: { id } });
    
    if (!testResult) {
      throw new NotFoundException(`Test result with ID ${id} not found`);
    }
    
    return testResult;
  }
}
