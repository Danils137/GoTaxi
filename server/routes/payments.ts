import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Создание Stripe Connect аккаунта для водителя
router.post('/setup-driver', async (req, res) => {
  try {
    const { driverId, email, phone, country = 'RU' } = req.body;
    
    if (!driverId || !email) {
      return res.status(400).json({ message: 'Driver ID and email are required' });
    }

    // Создаем Express аккаунт для быстрой настройки
    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        driverId: driverId.toString(),
        phone: phone || '',
      }
    });

    // Создаем ссылку для завершения настройки аккаунта
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.CLIENT_URL}/driver/payment-setup?refresh=true`,
      return_url: `${process.env.CLIENT_URL}/driver/payment-setup?success=true`,
      type: 'account_onboarding',
    });

    // Сохраняем Stripe Account ID в базе данных водителя
    // await Driver.findByIdAndUpdate(driverId, { 
    //   stripeAccountId: account.id,
    //   paymentSetupStatus: 'pending'
    // });

    res.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
      message: 'Driver payment account created successfully'
    });

  } catch (error) {
    console.error('Error setting up driver payment:', error);
    res.status(500).json({ message: 'Failed to setup driver payment account' });
  }
});

// Проверка статуса аккаунта водителя
router.get('/driver-status/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    
    // Получаем водителя из базы данных
    // const driver = await Driver.findById(driverId);
    // if (!driver || !driver.stripeAccountId) {
    //   return res.status(404).json({ message: 'Driver payment account not found' });
    // }

    // Для демонстрации используем заглушку
    const stripeAccountId = req.query.accountId as string;
    
    if (!stripeAccountId) {
      return res.status(400).json({ message: 'Stripe account ID required' });
    }

    const account = await stripe.accounts.retrieve(stripeAccountId);
    
    res.json({
      accountId: account.id,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements,
      status: account.charges_enabled && account.payouts_enabled ? 'active' : 'pending'
    });

  } catch (error) {
    console.error('Error checking driver payment status:', error);
    res.status(500).json({ message: 'Failed to check payment status' });
  }
});

// Создание платежного намерения для поездки
router.post('/create-ride-payment', async (req, res) => {
  try {
    const { 
      rideId, 
      amount, 
      currency = 'rub', 
      customerId, 
      driverAccountId,
      applicationFeeAmount = 0 // Комиссия платформы
    } = req.body;
    
    if (!rideId || !amount || !customerId || !driverAccountId) {
      return res.status(400).json({ 
        message: 'Ride ID, amount, customer ID, and driver account ID are required' 
      });
    }

    // Создаем платежное намерение с автоматическим переводом водителю
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Конвертируем в копейки
      currency,
      customer: customerId,
      application_fee_amount: Math.round(applicationFeeAmount * 100),
      transfer_data: {
        destination: driverAccountId,
      },
      metadata: {
        rideId: rideId.toString(),
        type: 'ride_payment'
      },
      description: `Оплата поездки #${rideId}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency
    });

  } catch (error) {
    console.error('Error creating ride payment:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

// Подтверждение платежа после завершения поездки
router.post('/confirm-ride-payment', async (req, res) => {
  try {
    const { paymentIntentId, finalAmount } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment intent ID is required' });
    }

    // Получаем платежное намерение
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (finalAmount && finalAmount !== (paymentIntent.amount / 100)) {
      // Если финальная сумма отличается, обновляем платеж
      const updatedPaymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
        amount: Math.round(finalAmount * 100),
      });
      
      res.json({
        status: updatedPaymentIntent.status,
        amount: finalAmount,
        message: 'Payment amount updated and confirmed'
      });
    } else {
      res.json({
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        message: 'Payment confirmed'
      });
    }

  } catch (error) {
    console.error('Error confirming ride payment:', error);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
});

// Отмена платежа (если поездка отменена)
router.post('/cancel-ride-payment', async (req, res) => {
  try {
    const { paymentIntentId, reason = 'requested_by_customer' } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment intent ID is required' });
    }

    const canceledPayment = await stripe.paymentIntents.cancel(paymentIntentId, {
      cancellation_reason: reason
    });

    res.json({
      status: canceledPayment.status,
      message: 'Payment canceled successfully'
    });

  } catch (error) {
    console.error('Error canceling ride payment:', error);
    res.status(500).json({ message: 'Failed to cancel payment' });
  }
});

// Получение истории платежей водителя
router.get('/driver-earnings/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    const { limit = 10, starting_after } = req.query;
    
    // Получаем Stripe Account ID водителя из базы данных
    // const driver = await Driver.findById(driverId);
    // if (!driver || !driver.stripeAccountId) {
    //   return res.status(404).json({ message: 'Driver payment account not found' });
    // }

    // Для демонстрации используем заглушку
    const stripeAccountId = req.query.accountId as string;
    
    if (!stripeAccountId) {
      return res.status(400).json({ message: 'Stripe account ID required' });
    }

    // Получаем переводы на аккаунт водителя
    const transfers = await stripe.transfers.list({
      destination: stripeAccountId,
      limit: Number(limit),
      starting_after: starting_after as string,
    });

    // Получаем баланс аккаунта
    const balance = await stripe.balance.retrieve({
      stripeAccount: stripeAccountId,
    });

    res.json({
      transfers: transfers.data,
      hasMore: transfers.has_more,
      balance: balance.available,
      pending: balance.pending
    });

  } catch (error) {
    console.error('Error getting driver earnings:', error);
    res.status(500).json({ message: 'Failed to get driver earnings' });
  }
});

// Создание клиента Stripe для пользователя
router.post('/create-customer', async (req, res) => {
  try {
    const { userId, email, name, phone } = req.body;
    
    if (!userId || !email) {
      return res.status(400).json({ message: 'User ID and email are required' });
    }

    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      metadata: {
        userId: userId.toString()
      }
    });

    // Сохраняем Stripe Customer ID в базе данных пользователя
    // await User.findByIdAndUpdate(userId, { stripeCustomerId: customer.id });

    res.json({
      customerId: customer.id,
      message: 'Customer created successfully'
    });

  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Failed to create customer' });
  }
});

// Webhook для обработки событий Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send('Webhook signature verification failed');
  }

  // Обработка различных событий
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment succeeded:', paymentIntent.id);
      // Обновляем статус поездки в базе данных
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', failedPayment.id);
      // Обрабатываем неудачный платеж
      break;
      
    case 'account.updated':
      const account = event.data.object as Stripe.Account;
      console.log('Account updated:', account.id);
      // Обновляем статус аккаунта водителя
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export default router;

