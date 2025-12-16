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
   * Get user's subscription
   */
  static async getSubscription(userId: string): Promise<Subscription | null> {
    console.log('[SubscriptionService] Getting subscription for user:', userId)
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No subscription found - return null (user will create one)
          console.log('[SubscriptionService] No subscription found for user')
          return null
        }
        console.error('[SubscriptionService] Error fetching subscription:', error)
        throw error
      }

      console.log('[SubscriptionService] Found subscription:', data.plan, data.status)
      return toSubscription(data)
    } catch (error) {
      console.error('[SubscriptionService] getSubscription error:', error)
      throw error
    }
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
  static async upgradeToPremium(
    userId: string,
    billingCycle: BillingCycle,
    stripeCustomerId?: string,
    stripeSubscriptionId?: string,
    paypalSubscriptionId?: string
  ): Promise<Subscription> {
    console.log('[SubscriptionService] Upgrading user to premium:', userId)
    
    // Calculate period end based on billing cycle
    const now = new Date()
    const periodEnd = new Date(now)
    switch (billingCycle) {
      case 'monthly':
        periodEnd.setMonth(periodEnd.getMonth() + 1)
        break
      case 'quarterly':
        periodEnd.setMonth(periodEnd.getMonth() + 3)
        break
      case 'annual':
        periodEnd.setFullYear(periodEnd.getFullYear() + 1)
        break
    }

    try {
      // Use direct fetch to bypass Supabase client hanging issue
      console.log('[SubscriptionService] Using direct REST API to update subscription...')
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      // Skip getSession as it might be hanging - use anon key directly (RLS is disabled)
      console.log('[SubscriptionService] Making PATCH request to:', `${supabaseUrl}/rest/v1/subscriptions`)
      
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            plan: 'premium',
            billing_cycle: billingCycle,
            status: 'active',
            stripe_customer_id: stripeCustomerId || null,
            stripe_subscription_id: stripeSubscriptionId || null,
            paypal_subscription_id: paypalSubscriptionId || null,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
          })
        }
      )
      
      console.log('[SubscriptionService] Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[SubscriptionService] REST API error:', errorText)
        throw new Error(`Failed to update subscription: ${response.status} ${errorText}`)
      }
      
      const data = await response.json()
      console.log('[SubscriptionService] Update successful:', data)
      
      if (!data || data.length === 0) {
        // No existing subscription, create one
        console.log('[SubscriptionService] No existing subscription, creating new one...')
        const insertResponse = await fetch(
          `${supabaseUrl}/rest/v1/subscriptions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              user_id: userId,
              plan: 'premium',
              billing_cycle: billingCycle,
              status: 'active',
              stripe_customer_id: stripeCustomerId || null,
              stripe_subscription_id: stripeSubscriptionId || null,
              paypal_subscription_id: paypalSubscriptionId || null,
              current_period_start: now.toISOString(),
              current_period_end: periodEnd.toISOString(),
            })
          }
        )
        
        if (!insertResponse.ok) {
          const errorText = await insertResponse.text()
          console.error('[SubscriptionService] Insert error:', errorText)
          throw new Error(`Failed to create subscription: ${insertResponse.status} ${errorText}`)
        }
        
        const insertData = await insertResponse.json()
        console.log('[SubscriptionService] Created new subscription:', insertData)
        return toSubscription(insertData[0])
      }
      
      console.log('[SubscriptionService] Upgraded to premium successfully:', data[0].id, data[0].plan)
      return toSubscription(data[0])
    } catch (error) {
      console.error('[SubscriptionService] upgradeToPremium error:', error)
      throw error
    }
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
