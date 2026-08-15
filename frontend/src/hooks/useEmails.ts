import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import type { PaginatedEmails } from '../types/emails';

type EmailType = 'scheduled' | 'sent';

export default function useEmails(type: EmailType, page: number, search: string, isActiveTab: boolean) {
  const status = type === 'scheduled' ? 'SCHEDULED' : 'SENT';
  
  return useQuery<PaginatedEmails>({
    queryKey: ['emails', type, page, search],
    queryFn: async () => {
      const { data } = await api.get(`/emails?status=${status}&page=${page}&search=${search}`);
      return data.data;
    },
    refetchInterval: isActiveTab ? 3000 : false,
    placeholderData: (previousData) => previousData, // keepPreviousData replacement in v5
  });
}
