import { supabaseAdmin } from '../../lib/supabase';
import { createError } from '../../middleware/errorHandler';
import { TokenUsageInfo } from './usage.types';

const MAX_DAILY_TOKENS = 100_000; // adjust as needed

function getUTCMidnight(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function getNextMidnight(): Date {
  const midnight = getUTCMidnight();
  midnight.setUTCDate(midnight.getUTCDate() + 1);
  return midnight;
}

export async function getTokenUsage(userId: string): Promise<TokenUsageInfo> {
  const today = getUTCMidnight().toISOString().slice(0, 10);

  const { data, error } = await supabaseAdmin
    .from('token_usage')
    .select('tokens_used')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (error) throw createError('Failed to fetch token usage.', 500);

  return {
    tokensUsed: data?.tokens_used ?? 0,
    maxTokens: MAX_DAILY_TOKENS,
    resetAt: getNextMidnight().toISOString(),
  };
}

export async function checkTokenQuota(userId: string): Promise<void> {
  const today = getUTCMidnight().toISOString().slice(0, 10);

  const { data, error } = await supabaseAdmin
    .from('token_usage')
    .select('tokens_used')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (error) throw createError('Failed to check token quota.', 500);

  const used = data?.tokens_used ?? 0;
  if (used >= MAX_DAILY_TOKENS) {
    throw createError('Daily token limit reached. Please try again after midnight UTC.', 429);
  }
}

export async function recordTokenUsage(userId: string, tokensToAdd: number): Promise<void> {
  const today = getUTCMidnight().toISOString().slice(0, 10);

  // Fetch current usage, then update (safe increment)
  const { data } = await supabaseAdmin
    .from('token_usage')
    .select('tokens_used')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  const currentUsed = data?.tokens_used ?? 0;
  const newUsed = currentUsed + tokensToAdd;

  const { error } = await supabaseAdmin
    .from('token_usage')
    .upsert(
      {
        user_id: userId,
        date: today,
        tokens_used: newUsed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,date' }
    );

  if (error) {
    console.error('[usage.service] Failed to record token usage:', error);
  }
}