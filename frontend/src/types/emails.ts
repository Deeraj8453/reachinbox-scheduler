export interface Email {
  id: string;
  recipient: string;
  subject: string;
  status: 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED' | string;
  scheduledAt: string;
  senderId?: string;
  bullJobId?: string;
  createdAt?: string;
  body?: string;
}

export interface PaginatedEmails {
  emails: Email[];
  total: number;
}
