
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestResult } from './test-results.entity';
import { TestResultsService } from './test-results.service';
import { TestResultsController } from './test-results.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TestResult])],
  controllers: [TestResultsController],
  providers: [TestResultsService],
  exports: [TestResultsService],
})
export class TestResultsModule {}
