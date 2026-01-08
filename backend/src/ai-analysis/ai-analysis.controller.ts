
import { Controller, Post, Body } from '@nestjs/common';
import { AIAnalysisService } from './ai-analysis.service';

@Controller('analyze-test-results')
export class AIAnalysisController {
  constructor(private readonly aiAnalysisService: AIAnalysisService) {}

  @Post()
  async analyzeTestResults(@Body() data: { testType: string, results: any }) {
    return this.aiAnalysisService.analyzeTestResults(data.testType, data.results);
  }
}
