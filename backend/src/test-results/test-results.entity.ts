
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('test_results')
export class TestResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  test_type: string;

  @Column('json')
  results: any;

  @Column('json')
  answers: any[];

  @Column({ nullable: true })
  confidence_score: number;

  @CreateDateColumn()
  created_at: Date;
}
