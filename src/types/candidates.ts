
export interface Candidate {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  resume_url: string | null;
  motivation: string;
  experience: string;
  status: 'new' | 'contacted' | 'interview' | 'offer' | 'hired' | 'rejected';
  rating: number;
  notes: string | null;
}
