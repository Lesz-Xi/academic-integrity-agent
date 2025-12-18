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

// Convert database row to Subscription object
function toSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    plan: row.plan,
    billingCycle: row.billing_cycle,
    status: row.status,
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
   * Get user's subscription with session verification and retry logic
   */
  static async getSubscription(userId: string): Promise<Subscription | null> {
    console.log('[SubscriptionService] Getting subscription for user:', userId);
    
    // 1. Verify we have a valid session before querying (critical for OAuth flows)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.warn('[SubscriptionService] No valid session found, cannot query subscriptions:', sessionError);
      return null;
    }
    console.log('[SubscriptionService] Session verified, user:', sessionData.session.user.email);

    // 2. Try to fetch subscription with retry logic
    const fetchWithRetry = async (attempt: number): Promise<Subscription | null> => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No subscription found - return null (user will create one)
            console.log('[SubscriptionService] No subscription found for user');
            return null;
          }
          // If it's an auth/RLS error on first attempt, retry after a short delay
          if (attempt === 1 && (error.code === 'PGRST301' || error.message.includes('JWT'))) {
            console.warn('[SubscriptionService] Possible RLS/Auth timing issue, retrying in 1s...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchWithRetry(2);
          }
          console.error('[SubscriptionService] Error fetching subscription:', error);
          throw error;
        }

        console.log('[SubscriptionService] Found subscription:', data.plan, data.status);
        return toSubscription(data);
      } catch (error) {
        console.error('[SubscriptionService] getSubscription error:', error);
        throw error;
      }
    };

    return fetchWithRetry(1);
  }

  /**
   * Create a new subscription (typically free tier for new users)
   */
  static async createSubscription(
    userId: string,
    plan: SubscriptionPlan = 'free'
  ): Promise<Subscription> {
    console.log('[SubscriptionService] Creating subscription for user:', userId, 'plan:', plan)
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan,
          status: 'active',
        })
        .select()
        .single()

      if (error) {
        console.error('[SubscriptionService] Error creating subscription:', error)
        throw error
      }

      console.log('[SubscriptionService] Created subscription:', data.id)
      return toSubscription(data)
    } catch (error) {
      console.error('[SubscriptionService] createSubscription error:', error)
      throw error
    }
  }

  /**
   * Upgrade to premium subscription
   */
  /**
   * Upgrade to premium subscription
   * @deprecated logic moved to backend triggers/webhooks for security
   */
  static async upgradeToPremium(
    _userId: string,
    _billingCycle: BillingCycle,
    _stripeCustomerId?: string,
    _stripeSubscriptionId?: string,
    _paypalSubscriptionId?: string
  ): Promise<Subscription> {
    console.warn('[SubscriptionService] Client-side upgrade is deprecated and insecure.');
    throw new Error('Subscription upgrades must be processed via payment provider webhooks.');
  }

  /**
   * Cancel subscription (keeps access until period end)
   */
  static async cancelSubscription(userId: string): Promise<Subscription> {
    console.log('[SubscriptionService] Canceling subscription for user:', userId)
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('[SubscriptionService] Error canceling subscription:', error)
        throw error
      }

      console.log('[SubscriptionService] Subscription canceled')
      return toSubscription(data)
    } catch (error) {
      console.error('[SubscriptionService] cancelSubscription error:', error)
      throw error
    }
  }

  /**
   * Check if user has premium access
   */
  static async isPremium(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getSubscription(userId)
      
      if (!subscription) return false
      if (subscription.plan !== 'premium') return false
      if (subscription.status !== 'active' && subscription.status !== 'canceled') return false
      
      // If canceled, check if still within paid period
      if (subscription.status === 'canceled' && subscription.currentPeriodEnd) {
        return new Date() < subscription.currentPeriodEnd
      }
      
      return true
    } catch (error) {
      console.error('[SubscriptionService] isPremium check error:', error)
      return false
    }
  }

  /**
   * Get or create subscription for user
   */
  static async getOrCreateSubscription(userId: string): Promise<Subscription> {
    let subscription = await this.getSubscription(userId)
    
    if (!subscription) {
      subscription = await this.createSubscription(userId, 'free')
    }
    
    return subscription
  }
}
