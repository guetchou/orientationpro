
export interface Appointment {
  id: string;
  conseiller_id: string;
  student_id: string;
  student_email?: string;
  date: string;
  time: string;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
  reminder_sent?: boolean;
  reminder_scheduled?: string;
}
