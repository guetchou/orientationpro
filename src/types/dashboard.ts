
export interface ConseillerStats {
  conseiller_id: string;
  total_students: number;
  tests_completed: number;
  appointments_scheduled: number;
  average_progress: number;
}

export interface StudentProgress {
  student_id: string;
  student_name: string;
  completed_tests: number;
  last_test_date: string;
  progress_score: number;
}
