
export interface Appointment {
  id: string;
  conseiller_id: string | null;
  student_id: string | null;
  student_email?: string;
  date: string;
  time: string;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string | null;
  updated_at: string | null;
  profiles?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
}
