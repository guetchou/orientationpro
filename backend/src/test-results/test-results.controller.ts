
import { Controller, Post, Get, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { TestResultsService } from './test-results.service';
import { CreateTestResultDto, TestResultResponseDto } from './test-results.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('test-results')
export class TestResultsController {
  constructor(private readonly testResultsService: TestResultsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createTestResultDto: CreateTestResultDto): Promise<TestResultResponseDto> {
    const testResult = await this.testResultsService.create(createTestResultDto);
    return {
      id: testResult.id,
      user_id: testResult.user_id,
      test_type: testResult.test_type,
      results: testResult.results,
      answers: testResult.answers,
      confidence_score: testResult.confidence_score,
      created_at: testResult.created_at
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  async findByUserId(@Param('id') id: string): Promise<TestResultResponseDto[]> {
    const testResults = await this.testResultsService.findByUserId(+id);
    return testResults.map(result => ({
      id: result.id,
      user_id: result.user_id,
      test_type: result.test_type,
      results: result.results,
      answers: result.answers,
      confidence_score: result.confidence_score,
      created_at: result.created_at
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('current')
  async findByCurrentUser(@Request() req): Promise<TestResultResponseDto[]> {
    const userId = req.user.userId;
    const testResults = await this.testResultsService.findByUserId(userId);
    return testResults.map(result => ({
      id: result.id,
      user_id: result.user_id,
      test_type: result.test_type,
      results: result.results,
      answers: result.answers,
      confidence_score: result.confidence_score,
      created_at: result.created_at
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TestResultResponseDto> {
    const testResult = await this.testResultsService.findById(+id);
    return {
      id: testResult.id,
      user_id: testResult.user_id,
      test_type: testResult.test_type,
      results: testResult.results,
      answers: testResult.answers,
      confidence_score: testResult.confidence_score,
      created_at: testResult.created_at
    };
  }
}
