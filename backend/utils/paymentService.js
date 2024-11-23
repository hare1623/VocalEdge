const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createSubscription = async (customerId) => {
    try {
        const subscription = await razorpayInstance.subscriptions.create({
            plan_id: process.env.RAZORPAY_PLAN_ID,
            total_count: 12, // Total billing cycles (optional)
            customer_notify: 1, // Notify the customer via email
            notes: {
                customerId,
            },
        });

        return subscription;
    } catch (error) {
        console.error('Error creating subscription:', error);
        throw new Error('Subscription creation failed');
    }
};

module.exports = { createSubscription };
