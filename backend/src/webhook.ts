/** @format */

import {RequestHandler} from "express";
import {ParamsDictionary} from "express-serve-static-core";
import QueryString from "qs";
import {stripe} from "./stripe";
import type {Stripe} from "stripe";

type Handler = RequestHandler<
    ParamsDictionary,
    any,
    any,
    QueryString.ParsedQs,
    Record<string, any>
>;

export const stripeWebhookHandler: Handler = (request, response) => {
    console.log("STRIPE WEBHOOK HANDLER");
    const sig = request.headers["stripe-signature"];
    let event;

    // Verify webhook signature and extract the event.
    // See https://stripe.com/docs/webhooks/signatures for more information.
    try {
        event = stripe.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET,
        );
    } catch (err) {
        console.log(request.body, "SIG: ", sig);
        console.log("WEBHOOK ERROR: ", err.message);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }
    console.log("type: ", event.type);
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        handleCompletedCheckoutSession(session);
    }

    response.json({received: true});
};

function handleCompletedCheckoutSession(session: Stripe.Checkout.Session) {
    console.log(JSON.stringify(session));
}
