export interface TokenUsageInfo {
  tokensUsed: number;
  maxTokens: number;
  resetAt: string; // ISO date string
}

export interface TokenUsageRecord {
  id: string;
  user_id: string;
  date: string;
  tokens_used: number;
}