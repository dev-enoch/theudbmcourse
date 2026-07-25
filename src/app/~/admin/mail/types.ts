export interface ResendEmail {
  id: string;
  from: string;
  to: string[];
  created_at: string;
  subject: string;
  html?: string | null;
  text?: string | null;
  folder?: "inbox" | "sent";
}
