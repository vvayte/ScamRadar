import Stripe from 'stripe';

/**
 * Initializes the Stripe client using the secret key from the environment.
 * For MVP purposes we do not configure webhook signing or advanced features.
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

export default stripe;
