
import { render } from '@testing-library/react';
import { ConseillerDashboard } from '../ConseillerDashboard';
import { supabase } from '@/lib/supabaseClient';
import { ConseillerStats } from '@/types/dashboard';

// Mock the supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          total_students: 10,
          tests_completed: 25,
          appointments_scheduled: 15,
          average_progress: 75
        },
        error: null
      })
    }))
  }
}));

describe('ConseillerDashboard', () => {
  const mockStats: ConseillerStats = {
    total_students: 10,
    tests_completed: 25,
    appointments_scheduled: 15,
    average_progress: 75
  };

  it('renders the dashboard with stats', async () => {
    const { findByText } = render(<ConseillerDashboard />);
    
    // Wait for stats to load
    const totalStudents = await findByText('10');
    const testsCompleted = await findByText('25');
    
    expect(totalStudents).toBeDefined();
    expect(testsCompleted).toBeDefined();
  });
});
