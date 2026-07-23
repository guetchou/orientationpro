
import { render } from '@testing-library/react';
import { ConseillerDashboard } from '../ConseillerDashboard';

vi.mock('@supabase/auth-helpers-react', () => ({
  useUser: () => ({ id: 'test-conseiller' }),
}));

vi.mock('@/hooks/useConseillerStats', () => ({
  useConseillerStats: () => ({
    data: {
      total_students: 10,
      tests_completed: 25,
      appointments_scheduled: 15,
      average_progress: 75,
    },
    isLoading: false,
    error: null,
  }),
}));

vi.mock('../ConseillersAppointments', () => ({ ConseillersAppointments: () => null }));
vi.mock('../ConseillerAvailability', () => ({ ConseillerAvailability: () => null }));
vi.mock('../tabs/StudentsTab', () => ({ StudentsTab: () => null }));
vi.mock('../tabs/ReportsTab', () => ({ ReportsTab: () => null }));

describe('ConseillerDashboard', () => {
  it('renders the dashboard with stats', async () => {
    const { findByText } = render(<ConseillerDashboard />);
    
    // Wait for stats to load
    const totalStudents = await findByText('10');
    const testsCompleted = await findByText('25');
    
    expect(totalStudents).toBeDefined();
    expect(testsCompleted).toBeDefined();
  });
});
