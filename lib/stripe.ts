import Stripe from 'stripe';

/**
 * Initializes the Stripe client using the secret key from the environment.
 * Checkout and webhooks return explicit configuration errors when the key is missing.
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

export default stripe;
