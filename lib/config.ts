// Subscription plans configuration
export const SUBSCRIPTION_PLANS = [
  {
    name: 'Basic',
    price: 10,
    credits: 30,
    description: 'Perfect for occasional use',
    // Product ID will be set from environment variable
  },
  {
    name: 'Standard',
    price: 30,
    credits: 100,
    description: 'Best for regular users',
  },
  {
    name: 'Premium',
    price: 100,
    credits: 350,
    description: 'For power users and businesses',
  },
] as const

// Get product IDs from environment variables
export function getProductIds() {
  return {
    basic: process.env.NEXT_PUBLIC_CREEM_PRODUCT_BASIC_ID || 'prod_1l9cjsowPhSJlsfrTTXlKb',
    standard: process.env.NEXT_PUBLIC_CREEM_PRODUCT_STANDARD_ID || 'prod_3CQsZ5gNb1Nhkl9a3Yxhs2',
    premium: process.env.NEXT_PUBLIC_CREEM_PRODUCT_PREMIUM_ID || 'prod_5h3JThYd4iw4SIDm6L5sCO',
  }
}

// Get plans with product IDs
export function getPlans() {
  const productIds = getProductIds()
  return SUBSCRIPTION_PLANS.map((plan, index) => ({
    ...plan,
    productId: index === 0 ? productIds.basic : index === 1 ? productIds.standard : productIds.premium,
  }))
}
