
import { Module } from '@nestjs/common';
import { AIAnalysisController } from './ai-analysis.controller';
import { AIAnalysisService } from './ai-analysis.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [AIAnalysisController],
  providers: [AIAnalysisService],
  exports: [AIAnalysisService],
})
export class AIAnalysisModule {}
