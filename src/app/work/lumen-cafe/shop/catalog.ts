import type { StaticImageData } from "next/image";

import beansBag from "../media/beans-bag.jpg";
import galBeans from "../media/gal-beans.jpg";
import galCheers from "../media/gal-cheers.jpg";
import secFilter from "../media/sec-filter.jpg";
import shopCafetiere from "../media/shop-cafetiere.jpg";
import shopDecaf from "../media/shop-decaf.jpg";
import shopHouseBlend from "../media/shop-house-blend.jpg";
import shopMug from "../media/shop-mug.jpg";
import shopSidama from "../media/shop-sidama.jpg";
import shopTote from "../media/shop-tote.jpg";

/**
 * The shop's catalogue.
 *
 * Deliberately its own module rather than part of `data.ts`. The cart runs in
 * the browser and needs to look products up by slug, so this file ends up in
 * the client bundle — `data.ts` carries every journal post body and must not.
 *
 * Prices are whole pesos, as integers. Money is never a float here and never
 * carries its own symbol; `formatPeso` is the only thing that renders it.
 */

export type ShopCategory = "Beans" | "Brewing" | "In the room" | "Gifts";

export const CATEGORIES: ShopCategory[] = ["Beans", "Brewing", "In the room", "Gifts"];

export type VariantOption = {
  id: string;
  label: string;
  /** Added to the base price. Most options are free. */
  priceDelta?: number;
  note?: string;
};

export type VariantGroup = {
  id: string;
  label: string;
  /** Shown under the picker to explain why the choice matters. */
  hint?: string;
  options: VariantOption[];
};

export type Product = {
  slug: string;
  name: string;
  category: ShopCategory;
  price: number;
  blurb: string;
  description: string[];
  image?: StaticImageData;
  imageAlt?: string;
  /** 0 means sold out; anything under 6 shows a low-stock note. */
  stock: number;
  variants?: VariantGroup[];
  facts?: { label: string; value: string }[];
};

const GRIND: VariantGroup = {
  id: "grind",
  label: "Grind",
  hint: "Tell us the machine, not just “espresso”. A moka pot and a lever want very different things.",
  options: [
    { id: "whole", label: "Whole bean" },
    { id: "espresso", label: "Espresso" },
    { id: "filter", label: "V60 / filter" },
    { id: "moka", label: "Moka pot" },
    { id: "press", label: "Cafetière" },
  ],
};

const SIZE: VariantGroup = {
  id: "size",
  label: "Size",
  options: [
    { id: "250g", label: "250g" },
    { id: "1kg", label: "1kg", priceDelta: 1650, note: "Roasted to order" },
  ],
};

export const products: Product[] = [
  {
    slug: "washed-benguet",
    name: "Washed Benguet",
    category: "Beans",
    price: 620,
    blurb: "On the grinder now. Bright, a little floral, takes milk well.",
    description: [
      "A washed lot from a co-operative about six hours north of the café, and the first we have bought from them.",
      "Bright without being sharp. Something floral in the first sip and a sort of dried apricot underneath it — though we would not blame you for not finding that.",
    ],
    image: beansBag,
    imageAlt: "A retail bag of Lumen coffee beans.",
    stock: 24,
    variants: [GRIND, SIZE],
    facts: [
      { label: "Origin", value: "Benguet, Philippines" },
      { label: "Process", value: "Washed" },
      { label: "Roast", value: "Medium" },
      { label: "Roasted", value: "Every Tuesday" },
    ],
  },
  {
    slug: "house-blend",
    name: "Lumen House Blend",
    category: "Beans",
    price: 540,
    blurb: "What the flat whites are built on. Does not change.",
    description: [
      "The one thing on the bar that never rotates. Chocolate and cooked sugar, enough body to hold up under milk, forgiving if your dose is a gram out.",
      "If you are buying for a household that drinks it different ways, buy this one.",
    ],
    image: shopHouseBlend,
    imageAlt: "A bag of house blend beside a grinder and an enamel mug.",
    stock: 40,
    variants: [GRIND, SIZE],
    facts: [
      { label: "Origin", value: "Blend — Brazil, Benguet" },
      { label: "Process", value: "Natural and washed" },
      { label: "Roast", value: "Medium-dark" },
      { label: "Roasted", value: "Every Tuesday" },
    ],
  },
  {
    slug: "sidama-natural",
    name: "Sidama Natural",
    category: "Beans",
    price: 680,
    blurb: "Loud, fruity, not for everyone. Sold out until Tuesday.",
    description: [
      "A natural-process Ethiopian that tastes like strawberry and gets called “wrong” by about one customer in five. The other four come back for it.",
      "Best on filter. It will work on espresso if you go long, but you are fighting it.",
    ],
    image: shopSidama,
    imageAlt: "Roasted coffee beans spilling from a hessian sack.",
    stock: 0,
    variants: [GRIND, SIZE],
    facts: [
      { label: "Origin", value: "Sidama, Ethiopia" },
      { label: "Process", value: "Natural" },
      { label: "Roast", value: "Light" },
      { label: "Roasted", value: "Every Tuesday" },
    ],
  },
  {
    slug: "decaf-sugarcane",
    name: "Decaf, Sugarcane Process",
    category: "Beans",
    price: 580,
    blurb: "Decaf that does not taste like an apology.",
    description: [
      "Decaffeinated with sugarcane ethanol rather than solvent, which keeps most of what made it worth drinking.",
      "We keep it on because someone asks for it every single afternoon.",
    ],
    image: shopDecaf,
    imageAlt: "A white bowl of roasted coffee beans on a dark surface.",
    stock: 4,
    variants: [GRIND, SIZE],
    facts: [
      { label: "Origin", value: "Huila, Colombia" },
      { label: "Process", value: "Sugarcane E.A." },
      { label: "Roast", value: "Medium" },
      { label: "Caffeine", value: "Under 0.1%" },
    ],
  },
  {
    slug: "pour-over-set",
    name: "Pour-over Set",
    category: "Brewing",
    price: 890,
    blurb: "Ceramic dripper, glass server, and a hundred filters.",
    description: [
      "The set we actually use on the bar, minus the bar. Everything you need to brew a cup properly except the kettle and the scale.",
      "If you have never done this before, ask when you collect and someone will walk you through it in about four minutes.",
    ],
    image: secFilter,
    imageAlt: "A row of pour-over brewers on the bar, one mid-pour.",
    stock: 7,
    facts: [
      { label: "Includes", value: "Dripper, server, 100 filters" },
      { label: "Capacity", value: "600ml" },
      { label: "Material", value: "Ceramic and glass" },
    ],
  },
  {
    slug: "cafetiere-800",
    name: "Cafetière, 800ml",
    category: "Brewing",
    price: 1250,
    blurb: "Four cups, no filters to buy, very hard to get wrong.",
    description: [
      "The most forgiving way to brew at home and the one we recommend to people who say they cannot be bothered with a ritual.",
      "Coarse grind, four minutes, push down slowly. That is the whole method.",
    ],
    image: shopCafetiere,
    imageAlt: "A glass cafetière full of brewed coffee, plunger beside it.",
    stock: 3,
    facts: [
      { label: "Capacity", value: "800ml — four cups" },
      { label: "Material", value: "Borosilicate glass, steel" },
      { label: "Grind", value: "Coarse" },
    ],
  },
  {
    slug: "lumen-mug",
    name: "Lumen Mug",
    category: "In the room",
    price: 480,
    blurb: "The one off the shelf behind the bar. 280ml, stoneware.",
    description: [
      "Thick enough to keep a flat white hot to the last mouthful, and the handle fits a whole finger, which sounds trivial until you have used one that does not.",
      "Dishwasher safe. We have dropped several and lost two.",
    ],
    image: shopMug,
    imageAlt: "A plain white stoneware mug on a pale background.",
    stock: 18,
    facts: [
      { label: "Capacity", value: "280ml" },
      { label: "Material", value: "Glazed stoneware" },
      { label: "Care", value: "Dishwasher safe" },
    ],
  },
  {
    slug: "canvas-tote",
    name: "Canvas Tote",
    category: "In the room",
    price: 390,
    blurb: "Heavy cotton, holds four bags of beans and a laptop.",
    description: [
      "Unbleached 12oz cotton with the wordmark printed small on the bottom corner, because nobody wants to be a billboard.",
      "It is the bag we pack larger orders into, so if you buy a kilo you are getting one anyway.",
    ],
    image: shopTote,
    imageAlt: "A plain kraft-coloured canvas tote bag.",
    stock: 26,
    facts: [
      { label: "Material", value: "12oz unbleached cotton" },
      { label: "Size", value: "38 × 42cm" },
      { label: "Handle", value: "60cm, stitched" },
    ],
  },
  {
    slug: "gift-card",
    name: "Gift Card",
    category: "Gifts",
    price: 1000,
    blurb: "Any amount, no expiry, works on coffee and on beans.",
    description: [
      "Printed on card and handed over in person, or posted if you would rather. No expiry date, because expiring someone's gift is a strange thing to do.",
      "Spendable on anything — the bar, the kitchen, the shelf.",
    ],
    image: galCheers,
    imageAlt: "Three coffees held together over a table.",
    stock: 99,
    variants: [
      {
        id: "value",
        label: "Value",
        options: [
          { id: "1000", label: "₱1,000" },
          { id: "2000", label: "₱2,000", priceDelta: 1000 },
          { id: "5000", label: "₱5,000", priceDelta: 4000 },
        ],
      },
    ],
    facts: [
      { label: "Expiry", value: "None" },
      { label: "Use", value: "Bar, kitchen and shelf" },
    ],
  },
  {
    slug: "beans-subscription",
    name: "Beans, every fortnight",
    category: "Gifts",
    price: 1700,
    blurb: "Whatever is on the grinder, ground how you like it.",
    description: [
      "Three deliveries, a fortnight apart, of whatever single origin we are pouring at the time. You will not get the same coffee twice.",
      "It is the only way to drink the Sidama, which sells out in about four days every time it lands.",
    ],
    image: galBeans,
    imageAlt: "Roasted coffee beans, close up.",
    stock: 12,
    variants: [
      GRIND,
      {
        id: "term",
        label: "Term",
        options: [
          { id: "3", label: "3 deliveries" },
          { id: "6", label: "6 deliveries", priceDelta: 1600, note: "Saves ₱100" },
        ],
      },
    ],
    facts: [
      { label: "Frequency", value: "Every fortnight" },
      { label: "Size", value: "250g per delivery" },
      { label: "Cancel", value: "Any time" },
    ],
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug) ?? null;
}

/** Whole pesos, grouped, with the symbol. The only place money is rendered. */
export function formatPeso(amount: number) {
  return `₱${amount.toLocaleString("en-PH")}`;
}

/** Base price plus every selected option's delta. */
export function priceOf(product: Product, chosen: Record<string, string> = {}) {
  return (product.variants ?? []).reduce((total, group) => {
    const option = group.options.find((o) => o.id === chosen[group.id]);
    return total + (option?.priceDelta ?? 0);
  }, product.price);
}

/** The default selection for a product — the first option of every group. */
export function defaultVariants(product: Product): Record<string, string> {
  return Object.fromEntries(
    (product.variants ?? []).map((group) => [group.id, group.options[0].id]),
  );
}

/** Human-readable summary of a selection, e.g. "Espresso · 1kg". */
export function describeVariants(product: Product, chosen: Record<string, string>) {
  return (product.variants ?? [])
    .map((group) => group.options.find((o) => o.id === chosen[group.id])?.label)
    .filter(Boolean)
    .join(" · ");
}

/* Delivery ---------------------------------------------------------------- */

export const DELIVERY_FEE = 150;
export const FREE_DELIVERY_OVER = 2500;

export function deliveryFor(subtotal: number) {
  return subtotal >= FREE_DELIVERY_OVER || subtotal === 0 ? 0 : DELIVERY_FEE;
}
