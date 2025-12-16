// PayPal Payment Service
// Handles PayPal order creation and payment processing

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID
// Production mode configured via client ID

export interface PayPalOrderData {
  planId: string
  planName: string
  amount: string // e.g., "12.00"
  currency: string // e.g., "USD"
  billingCycle: 'monthly' | 'quarterly' | 'annual'
}

export interface PayPalOrderResponse {
  id: string
  status: string
  links: Array<{
    href: string
    rel: string
    method: string
  }>
}

/**
 * Load PayPal SDK script
 */
export const loadPayPalScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.paypal) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'))
    document.body.appendChild(script)
  })
}

/**
 * Create PayPal order
 */
export const createPayPalOrder = async (orderData: PayPalOrderData): Promise<string> => {
  console.log('[PayPal] Creating order:', orderData)
  
  try {
    // Ensure PayPal SDK is loaded
    if (!window.paypal) {
      throw new Error('PayPal SDK not loaded')
    }

    // Create order using PayPal SDK
    const order = await window.paypal.Buttons({
      createOrder: (_data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            description: `${orderData.planName} - ${orderData.billingCycle}`,
            amount: {
              currency_code: orderData.currency,
              value: orderData.amount
            }
          }]
        })
      }
    }).createOrder()

    console.log('[PayPal] Order created:', order)
    return order
  } catch (error) {
    console.error('[PayPal] Error creating order:', error)
    throw error
  }
}

/**
 * Capture PayPal payment
 */
export const capturePayPalPayment = async (orderId: string): Promise<any> => {
  console.log('[PayPal] Capturing payment for order:', orderId)
  
  try {
    if (!window.paypal) {
      throw new Error('PayPal SDK not loaded')
    }

    const details = await window.paypal.Buttons({
      onApprove: async (_data: any, actions: any) => {
        return actions.order.capture()
      }
    }).onApprove({ orderID: orderId }, {
      order: {
        capture: async () => {
          return {
            id: orderId,
            status: 'COMPLETED'
          }
        }
      }
    })

    console.log('[PayPal] Payment captured:', details)
    return details
  } catch (error) {
    console.error('[PayPal] Error capturing payment:', error)
    throw error
  }
}

/**
 * Verify PayPal order server-side
 */
export const verifyPayPalOrder = async (orderId: string, billingCycle: 'monthly' | 'quarterly' | 'annual'): Promise<void> => {
  console.log('[PayPal] Verifying order server-side:', orderId)
  
  const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession())
  
  if (!session) {
    throw new Error('User not authenticated')
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paypal-verify`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId, billingCycle }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Payment verification failed: ${errorText}`)
  }
  
  const result = await response.json()
  console.log('[PayPal] Verification result:', result)
}

/**
 * Render PayPal button
 */
export const renderPayPalButton = (
  containerId: string,
  orderData: PayPalOrderData,
  onSuccess: (details: any) => void,
  onError: (error: any) => void
): void => {
  if (!window.paypal) {
    console.error('[PayPal] SDK not loaded')
    return
  }

  window.paypal.Buttons({
    style: {
      layout: 'vertical',
      color: 'gold',
      shape: 'rect',
      label: 'paypal'
    },
    createOrder: (_data: any, actions: any) => {
      return actions.order.create({
        purchase_units: [{
          description: `${orderData.planName} - ${orderData.billingCycle}`,
          amount: {
            currency_code: orderData.currency,
            value: orderData.amount
          }
        }]
      })
    },
    onApprove: async (_data: any, actions: any) => {
      try {
        const details = await actions.order.capture()
        console.log('[PayPal] Payment successful:', details)
        onSuccess(details)
        return details
      } catch (error) {
        console.error('[PayPal] Payment capture failed:', error)
        onError(error)
        throw error
      }
    },
    onError: (err: any) => {
      console.error('[PayPal] Payment error:', err)
      onError(err)
    }
  }).render(`#${containerId}`)
}

// Declare PayPal SDK types
declare global {
  interface Window {
    paypal?: any
  }
}
