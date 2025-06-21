import dayjs from "dayjs";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { serve } = require('@upstash/workflow/express');
import Subscription from "../models/subscription.model.js";

const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async (context) => {
    const { subscriptionId } = context.requestPayload;
    const subscription = await fetchSubscription(subscriptionId);

    if (!subscription || subscription.status !== 'active') return;

    const renewalDate = dayjs(subscription.renewalDate);

    if (renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
        return;
    }

    for (const daysBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(daysBefore, 'day');
        // if renewal date is 22nd of feb then reminder date will be 15th feb => 7 days before, then 17th feb => 5 days before
        // then 20 and 21.
        if (reminderDate.isAfter(dayjs())) {
            await sleepUntilRemainder(context, `Remainder ${daysBefore} days before`, reminderDate);
        }
        await triggerReminder(context, `Remainder ${daysBefore} days before`);
    }
});


const fetchSubscription = async (context, subscriptionId) => {
    return await context.run('get subscription', async () => {
        return Subscription.findById(subscriptionId).populate('user', 'name email')
    })
}

const sleepUntilRemainder = async (context, label, date) => {
    console.log(`Sleeping until ${label} remainder at ${date}`);
    await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async (context, label) => {
    return await context.run(label, () => {
        console.log(`Triggering ${label} remainder`);
        // Send email, SMS, push notification ...
    })
}