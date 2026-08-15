import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export interface DashboardStats {
  totalCampaigns: number;
  scheduled: number;
  sending: number;
  sent: number;
  failed: number;
}

export default function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats');
      return data.data;
    },
    refetchInterval: 5000,
  });
}
