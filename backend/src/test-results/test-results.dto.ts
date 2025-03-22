
import { IsNotEmpty, IsArray, IsObject, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTestResultDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsNotEmpty()
  @IsString()
  test_type: string;

  @IsNotEmpty()
  @IsObject()
  results: any;

  @IsNotEmpty()
  @IsArray()
  answers: any[];

  @IsOptional()
  @IsNumber()
  confidence_score?: number;
}

export class TestResultResponseDto {
  id: number;
  user_id: number;
  test_type: string;
  results: any;
  answers: any[];
  confidence_score?: number;
  created_at: Date;
}
