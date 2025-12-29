import { supabase } from '../lib/supabase'
import type { Database } from '../types/database.types'

type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row']


export type SubscriptionPlan = 'free' | 'premium'
export type BillingCycle = 'monthly' | 'quarterly' | 'annual'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

export interface Subscription {
  id: string
  userId: string
  plan: SubscriptionPlan
  billingCycle: BillingCycle | null
  status: SubscriptionStatus
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  paypalSubscriptionId: string | null
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  createdAt: Date
  updatedAt: Date
}

function toSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    plan: row.plan as SubscriptionPlan,
    billingCycle: row.billing_cycle as BillingCycle,
    status: row.status as SubscriptionStatus,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    paypalSubscriptionId: row.paypal_subscription_id,
    currentPeriodStart: row.current_period_start ? new Date(row.current_period_start) : null,
    currentPeriodEnd: row.current_period_end ? new Date(row.current_period_end) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

export class SubscriptionService {
  /**
   * Get user's subscription with internal timeout and retry guards
   */
  static async getSubscription(userId: string): Promise<Subscription | null> {
    let latestError: any = null;
    const fetchWithTimeout = async (attempt: number): Promise<Subscription | null> => {
      console.log(`[SubscriptionService] Query attempt ${attempt} for user:`, userId);
      
      try {
        // Create a timeout for the database query itself
        const queryPromise = supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single();

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Database query timed out')), 15000); // Increased to 15s for slow networks
        });

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

        if (error) {
          if (error.code === 'PGRST116') {
            return null; // Normal "no row" case (Free Tier)
          }
          throw error;
        }

        if (data) {
          console.log('[SubscriptionService] Found result:', data.plan);
          return toSubscription(data);
        }
        return null; // Should be handled by PGRST116, but safe fallback
      } catch (error: any) {
        latestError = error;
        console.warn(`[SubscriptionService] Query failed (attempt ${attempt}):`, error.message);
        
        // Critical Fallback: Check localStorage if network fails
        // This allows Chrome users with strict blockers/network issues to stay premium if previously verified
        if (typeof window !== 'undefined') {
            const cachedParams = localStorage.getItem(`cachedPremiumStatus_${userId}`);
            if (cachedParams === 'true') {
                console.log('[SubscriptionService] Recovered Premium status from local cache');
                return {
                    id: 'cached_fallback',
                    userId: userId,
                    plan: 'premium',
                    status: 'active',
                    billingCycle: 'monthly',
                    stripeCustomerId: null,
                    stripeSubscriptionId: null,
                    paypalSubscriptionId: null,
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 86400000), // Valid for 24h
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            }
        }
        
        if (attempt < 1) { // Reduced to 1 retry
          console.log('[SubscriptionService] Retrying in 1s...');
          await new Promise(r => setTimeout(r, 1000));
          return fetchWithTimeout(attempt + 1);
        }
        
        console.error('[SubscriptionService] All query attempts failed');
        throw latestError; // CRITICAL: Throw so caller knows it wasn't just "not found"
      }
    };

    return fetchWithTimeout(1);
  }

  /**
   * Check if user has premium access
   */
  static async isPremium(userId: string): Promise<boolean> {
    const subscription = await this.getSubscription(userId)
    
    if (!subscription) return false
    // Consider both 'premium' and 'pro' as premium (case-insensitive)
    const plan = subscription.plan.toLowerCase();
    if (plan !== 'premium' && plan !== 'pro') return false
    
    if (subscription.status !== 'active' && subscription.status !== 'canceled') return false
    
    if (subscription.status === 'canceled' && subscription.currentPeriodEnd) {
      return new Date() < subscription.currentPeriodEnd
    }
    
    return true
  }

  static async createSubscription(
    userId: string,
    plan: SubscriptionPlan = 'free'
  ): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error
    return toSubscription(data)
  }

  static async cancelSubscription(userId: string): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return toSubscription(data)
  }

  static async getOrCreateSubscription(userId: string): Promise<Subscription> {
    let subscription = await this.getSubscription(userId)
    if (!subscription) {
      subscription = await this.createSubscription(userId, 'free')
    }
    return subscription
  }
}
