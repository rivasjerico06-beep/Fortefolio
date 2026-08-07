"use server";

import { deliveryFor, describeVariants, getProduct, priceOf } from "./shop/catalog";

/**
 * The write seam.
 *
 * Server Actions rather than plain exported functions, for one practical
 * reason: the forms are client components, and anything they import ends up in
 * the browser bundle. Keeping writes here means a form can call them directly
 * while the content module — every post body, every image — stays on the server.
 *
 * Nothing is delivered or charged. When a real inbox and a payment provider are
 * connected, these function bodies are the only things that change; the forms
 * already handle pending, success and failure around them.
 */

/* Enquiries --------------------------------------------------------------- */

export type EnquirySubject = "General" | "Large order" | "Private hire" | "Working here";

export type EnquiryDraft = {
  name: string;
  email: string;
  subject: EnquirySubject;
  message: string;
};

export type EnquiryResult =
  { ok: true; id: string; sentAt: string } | { ok: false; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendEnquiry(draft: EnquiryDraft): Promise<EnquiryResult> {
  // Validated again on the server: the client checks are for feedback, not trust
  if (!draft.name.trim()) return { ok: false, error: "Please tell us your name." };
  if (!EMAIL.test(draft.email)) return { ok: false, error: "That email address looks wrong." };
  if (draft.message.trim().length < 10) {
    return { ok: false, error: "Please write a little more so we can help." };
  }

  await new Promise((resolve) => setTimeout(resolve, 700));

  return {
    ok: true,
    id: Math.random().toString(36).slice(2, 10),
    sentAt: new Date().toISOString(),
  };
}

/* Orders ------------------------------------------------------------------ */

export type OrderItem = {
  slug: string;
  variants: Record<string, string>;
  quantity: number;
};

export type OrderInput = {
  items: OrderItem[];
  contact: { name: string; email: string; phone: string };
  address: { line1: string; city: string; postcode: string; notes?: string };
};

export type PlacedOrder = {
  reference: string;
  placedAt: string;
  lines: { name: string; description: string; quantity: number; lineTotal: number }[];
  subtotal: number;
  delivery: number;
  total: number;
};

export type OrderResult =
  { ok: true; order: PlacedOrder } | { ok: false; error: string; field?: string };

/**
 * Places an order.
 *
 * **Prices are recomputed here from the catalogue, never taken from the
 * request.** The browser sends what was chosen — slug, options, quantity — and
 * nothing about cost. A cart is client state, and client state is editable by
 * whoever holds the client; a checkout that bills the total it was handed is a
 * checkout that can be told to charge zero.
 *
 * Stock is re-checked for the same reason: the tab may have been open since
 * before the last roast sold out.
 */
export async function placeOrder(input: OrderInput): Promise<OrderResult> {
  const { items, contact, address } = input;

  if (items.length === 0) return { ok: false, error: "Your basket is empty." };
  if (!contact.name.trim())
    return { ok: false, error: "We need a name for the order.", field: "name" };
  if (!EMAIL.test(contact.email)) {
    return { ok: false, error: "That email address looks wrong.", field: "email" };
  }
  if (contact.phone.replace(/\D/g, "").length < 7) {
    return {
      ok: false,
      error: "We need a phone number in case the driver cannot find you.",
      field: "phone",
    };
  }
  if (!address.line1.trim())
    return { ok: false, error: "Please give a street address.", field: "line1" };
  if (!address.city.trim()) return { ok: false, error: "Please give a city.", field: "city" };

  const lines: PlacedOrder["lines"] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = getProduct(item.slug);
    if (!product)
      return { ok: false, error: "Something in your basket is no longer available." };
    if (product.stock === 0) {
      return { ok: false, error: `${product.name} sold out while you were shopping.` };
    }

    const quantity = Math.min(Math.max(1, Math.floor(item.quantity)), product.stock);
    const unitPrice = priceOf(product, item.variants);
    const lineTotal = unitPrice * quantity;
    subtotal += lineTotal;

    lines.push({
      name: product.name,
      description: describeVariants(product, item.variants),
      quantity,
      lineTotal,
    });
  }

  const delivery = deliveryFor(subtotal);

  await new Promise((resolve) => setTimeout(resolve, 900));

  return {
    ok: true,
    order: {
      // Looks like a real reference so the confirmation reads properly
      reference: `LUM-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      placedAt: new Date().toISOString(),
      lines,
      subtotal,
      delivery,
      total: subtotal + delivery,
    },
  };
}
