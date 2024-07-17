// eslint-disable-next-line import/prefer-default-export

// The cart lifetime possibly only applies to guest users. If a person has an account on the platform, their cart shouldn't possibly expire. Instead, the cart should be returned as is, and if the items in the cart are out of stock, a label should be shown on the cart item and a person should not be allowed to checkout if there are out-of-stock items in their cart.
export const CART_LIFETIME_IN_SECONDS = 60 * 60 * 24 * 30 // 30 days.
export const CART_LIFETIME_IN_MILLISECONDS = CART_LIFETIME_IN_SECONDS * 1000
