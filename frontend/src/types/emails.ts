export interface Email {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  status: 'SENT' | 'FAILED' | 'PROCESSING' | 'SCHEDULED' | string;
  scheduledAt: string | null;
  createdAt: string;
}

export interface PaginatedEmails {
  emails: Email[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
