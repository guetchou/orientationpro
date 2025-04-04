
import { Injectable } from '@nestjs/common';
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
    return this.testResultsRepository.findOne({ where: { id } });
  }
}
