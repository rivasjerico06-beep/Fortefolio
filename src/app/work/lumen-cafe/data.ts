import type { StaticImageData } from "next/image";

import beansBag from "./media/beans-bag.jpg";
import galBar from "./media/gal-bar.jpg";
import galBeans from "./media/gal-beans.jpg";
import galCheers from "./media/gal-cheers.jpg";
import galRoom from "./media/gal-room.jpg";
import galSign from "./media/gal-sign.jpg";
import galWindow from "./media/gal-window.jpg";
import heroRoom from "./media/hero-room.jpg";
import itemBatchBrew from "./media/item-batch-brew.jpg";
import itemColdBrew from "./media/item-cold-brew.jpg";
import itemCortado from "./media/item-cortado.jpg";
import itemCroissant from "./media/item-croissant.jpg";
import itemEspresso from "./media/item-espresso.jpg";
import itemFilterFlight from "./media/item-filter-flight.jpg";
import itemSourdough from "./media/item-sourdough.jpg";
import itemToastie from "./media/item-toastie.jpg";
import secEspresso from "./media/sec-espresso.jpg";
import secFilter from "./media/sec-filter.jpg";
import secKitchen from "./media/sec-kitchen.jpg";

/**
 * Everything the Lumen Café demo's pages share. Hours, menu and posts are
 * defined once here rather than copied into each route, which is also how a
 * real theme would read them out of the database.
 *
 * Photography is imported rather than linked, so Next knows each file's real
 * dimensions at build time. That is what lets `next/image` reserve the right
 * box before the bytes arrive and generate the blur placeholder — and it keeps
 * the demo free of third-party requests. Credits are in the README.
 */

export const BASE = "/work/lumen-cafe";

/** Flat nav — the redesign has no dropdowns, so there is nothing to nest. */
export const nav = [
  { label: "Menu", href: `${BASE}/menu` },
  { label: "Shop", href: `${BASE}/shop` },
  { label: "About", href: `${BASE}/about` },
  { label: "Journal", href: `${BASE}/blog` },
  { label: "Visit", href: `${BASE}/visit` },
] as const;

export const address = {
  street: "114 Kalayaan Avenue",
  area: "Poblacion, Makati",
  postcode: "Metro Manila 1210",
  phone: "+63 2 0000 0000",
};

export type MenuItem = {
  name: string;
  note: string;
  price: string;
  /** Only the items we have a photograph of — the rest are a plain row. */
  image?: StaticImageData;
  imageAlt?: string;
};

export type MenuSection = {
  id: string;
  section: string;
  note: string;
  image: StaticImageData;
  imageAlt: string;
  items: MenuItem[];
};

export const menu: MenuSection[] = [
  {
    id: "espresso",
    section: "Espresso",
    note: "Pulled on a two-group lever. Ask what is on the grinder.",
    image: secEspresso,
    imageAlt: "Steamed milk being poured into a cup to finish a rosetta.",
    items: [
      {
        name: "Espresso",
        note: "Single origin, rotating",
        price: "₱110",
        image: itemEspresso,
        imageAlt: "Two portafilters on a wooden board beside piles of ground coffee.",
      },
      {
        name: "Cortado",
        note: "Two parts milk",
        price: "₱140",
        image: itemCortado,
        imageAlt: "A small cup of coffee with latte art, next to a sprig of rosemary.",
      },
      { name: "Flat white", note: "Our house blend", price: "₱165" },
      { name: "Latte", note: "Hot or over ice", price: "₱170" },
      { name: "Mocha", note: "70% dark, not sweet", price: "₱185" },
    ],
  },
  {
    id: "filter",
    section: "Filter",
    note: "Brewed by the cup unless it is batch, which is on from seven.",
    image: secFilter,
    imageAlt:
      "A row of pour-over brewers on the bar, one being poured from a gooseneck kettle.",
    items: [
      { name: "Pour over", note: "V60, brewed to order", price: "₱180" },
      {
        name: "Cold brew",
        note: "18-hour steep",
        price: "₱175",
        image: itemColdBrew,
        imageAlt: "A tall glass of iced coffee with milk swirling through it.",
      },
      {
        name: "Batch brew",
        note: "Free refill before 10am",
        price: "₱120",
        image: itemBatchBrew,
        imageAlt: "A white mug of black filter coffee seen from directly above.",
      },
      {
        name: "Filter flight",
        note: "Three origins, 90ml each",
        price: "₱280",
        image: itemFilterFlight,
        imageAlt: "Cups of coffee arranged in a ring on a dark wooden board.",
      },
    ],
  },
  {
    id: "kitchen",
    section: "Kitchen",
    note: "The kitchen closes an hour before we do.",
    image: secKitchen,
    imageAlt: "A tray of croissants in the pastry case.",
    items: [
      {
        name: "Sourdough & cultured butter",
        note: "Baked each morning",
        price: "₱150",
        image: itemSourdough,
        imageAlt: "A dark sourdough loaf, sliced and fanned out on a board.",
      },
      {
        name: "Ham & gruyère toastie",
        note: "On sourdough",
        price: "₱285",
        image: itemToastie,
        imageAlt: "A toasted sandwich cut in half, griddle-marked, on a white plate.",
      },
      { name: "Ricotta toast", note: "Honey, thyme, lemon", price: "₱240" },
      {
        name: "Almond croissant",
        note: "Weekends only",
        price: "₱165",
        image: itemCroissant,
        imageAlt: "Croissants under a dusting of icing sugar.",
      },
      { name: "Banana bread", note: "Toasted, with butter", price: "₱140" },
    ],
  },
];

/** The home page's featured image. */
export const homeHero = {
  image: galRoom,
  alt: "The room at Lumen, looking back towards the window seats.",
};

/** The menu page's featured image, and the retail bag shot beside the beans note. */
export const menuHero = {
  image: heroRoom,
  alt: "The bar at Lumen, with the espresso machine and the chalkboard menu behind it.",
  caption: "The bar, about ten minutes after we open.",
};

export const beansImage = {
  image: beansBag,
  alt: "A retail bag of Lumen coffee beans.",
};

/** The scrolling notice bar under the featured image. */
export const ticker = [
  "Batch brew is free to refill before 10:00",
  "Beans roasted every Tuesday, eight kilometres away",
  "Almond croissants are weekends only",
  "Cash, cards and e-wallets — no minimum on card",
  "The kitchen runs until nine on Fridays and Saturdays",
];

/** The photo strip at the foot of the menu. */
export const gallery = [
  { image: galRoom, alt: "The room, looking back towards the window seats." },
  { image: galCheers, alt: "Three coffees held together over a table." },
  { image: galBar, alt: "The counter, with the day's boards written up behind it." },
  { image: galWindow, alt: "A window table set with a cafetière and cups." },
  { image: galBeans, alt: "Roasted coffee beans, close up." },
  { image: galSign, alt: "The café sign lit against the dark wall by the door." },
];

export const team = [
  {
    name: "Mariel",
    role: "Owner, roaster",
    bio: "Opened Lumen in 2021 after five years roasting for other people. Still does every Tuesday roast herself.",
  },
  {
    name: "Dan",
    role: "Head barista",
    bio: "Runs the bar most mornings. Responsible for the filter flight, which was not on the menu until he kept making it anyway.",
  },
  {
    name: "Joy",
    role: "Kitchen",
    bio: "Bakes the sourdough and the banana bread before the doors open. The almond croissants are hers too, which is why they are weekends only.",
  },
];

/** A post body is a short list of blocks so pages can render real structure. */
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: string[] };

export type Post = {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  body: Block[];
  comments: { author: string; date: string; body: string; reply?: boolean }[];
};

/** Newest first — the archive and the widgets both read this order. */
export const posts: Post[] = [
  {
    slug: "washed-benguet-on-the-grinder",
    title: "This month we are pouring a washed Benguet",
    date: "4 March 2026",
    category: "Coffee",
    tags: ["benguet", "single origin", "espresso"],
    excerpt:
      "Bright, a little floral, and it takes milk better than last month's Ethiopian did. On the grinder until roughly the end of the month, or until we run out.",
    body: [
      {
        type: "p",
        text: "The new single origin went on the grinder last Tuesday. It is a washed Benguet from a co-operative about six hours north of here, and it is the first lot we have bought from them.",
      },
      {
        type: "p",
        text: "It is bright without being sharp. There is something floral in the first sip and a sort of dried apricot underneath it, though we would not blame you for not finding that. What matters more day to day is that it takes milk far better than last month's Ethiopian did — the flat whites have stopped tasting thin.",
      },
      { type: "h2", text: "How we are brewing it" },
      {
        type: "ul",
        items: [
          "Espresso: 18g in, 44g out, about 28 seconds",
          "V60: 15g to 250g, two pours, just under three minutes",
          "Batch: slightly coarser than usual, which keeps it from going bitter as it sits",
        ],
      },
      {
        type: "p",
        text: 'If you are buying beans to take home, a 250g bag is ₱620 and we will grind it for whatever you brew on. Tell us the machine, not just "espresso" — a moka pot and a lever want very different things.',
      },
      {
        type: "quote",
        text: "It will be on until roughly the end of the month, or until we run out, which historically happens first.",
      },
    ],
    comments: [
      {
        author: "Ramon",
        date: "5 March 2026",
        body: "Had this as a cortado on Wednesday and came back Thursday for another. The apricot thing is real, I promise.",
      },
      {
        author: "Lumen",
        date: "5 March 2026",
        reply: true,
        body: "Glad it landed. There is about fifteen kilos left, so there is time.",
      },
      {
        author: "Bea",
        date: "9 March 2026",
        body: "Any chance of a decaf on filter? Asking for my husband, who is not allowed caffeine after two.",
      },
    ],
  },
  {
    slug: "kitchen-open-later-on-fridays",
    title: "The kitchen is open an hour later on Fridays",
    date: "18 February 2026",
    category: "News",
    tags: ["kitchen", "opening hours"],
    excerpt:
      "We have been getting a steady evening crowd since December, so the toasties now run until nine on Fridays and Saturdays. Everything else stays as it was.",
    body: [
      {
        type: "p",
        text: "Since about the middle of December there has been a steady evening crowd on Fridays, and we have been turning people away from the kitchen at eight while the room was still half full. That was silly, so we have stopped doing it.",
      },
      {
        type: "p",
        text: "From this week the kitchen runs until nine on Fridays and Saturdays. The toastie, the ricotta toast and the banana bread are all available that whole time. Everything else — the hours, the coffee, the last-order rule — stays exactly as it was.",
      },
      {
        type: "p",
        text: "The last coffee still goes out fifteen minutes before we close. That one is not us being difficult; it is the only way the machine gets cleaned before midnight.",
      },
    ],
    comments: [
      {
        author: "Teresa",
        date: "19 February 2026",
        body: "This is excellent news. The Friday toastie situation was genuinely upsetting.",
      },
    ],
  },
  {
    slug: "why-the-batch-brew-is-free-before-ten",
    title: "Why the batch brew is free to refill before ten",
    date: "2 February 2026",
    category: "Coffee",
    tags: ["batch brew", "filter"],
    excerpt:
      "It is not generosity. Batch coffee has a short life, and the fastest way to keep it good is to keep it moving.",
    body: [
      {
        type: "p",
        text: "People assume the free refill is a promotion. It is not, really. Batch brew has a short life — somewhere around forty minutes before it starts tasting flat and papery — and the only reliable way to keep it good is to keep going through it fast enough that we are always brewing a fresh one.",
      },
      {
        type: "p",
        text: "Before ten in the morning we have enough people through the door for that to work. After ten we do not, so the refill stops and we brew smaller batches instead.",
      },
      {
        type: "quote",
        text: "The offer exists because it makes the coffee better, and we would rather say so than pretend it is a favour.",
      },
    ],
    comments: [],
  },
  {
    slug: "we-are-closed-on-the-25th",
    title: "We are closed on the 25th",
    date: "14 January 2026",
    category: "News",
    tags: ["opening hours"],
    excerpt: "The whole team gets the day. We reopen at the usual seven the following morning.",
    body: [
      {
        type: "p",
        text: "We will be closed all day on the 25th. The whole team gets it off, including the kitchen, and we reopen at the usual seven the next morning.",
      },
      {
        type: "p",
        text: "If you need beans to see you through, come by on the 24th — we will have the Benguet and the house blend bagged and ready, and we will grind on request as usual.",
      },
    ],
    comments: [],
  },
  {
    slug: "a-short-guide-to-ordering-here",
    title: "A short guide to ordering here, if it is your first time",
    date: "3 January 2026",
    category: "Kitchen",
    tags: ["espresso", "pastry"],
    excerpt:
      "Twelve seats, one machine, and no table service. Here is roughly how it works, so nobody has to guess.",
    body: [
      {
        type: "p",
        text: "There are twelve seats and one espresso machine, and we do not do table service. You order at the bar, we bring it over, and you keep the table as long as you like.",
      },
      { type: "h2", text: "A few things worth knowing" },
      {
        type: "ul",
        items: [
          "The tables at the back have the plug sockets. Nobody will move you off them.",
          "If you want the filter flight, order it early — it takes about ten minutes.",
          "We do cash, cards and the usual e-wallets. There is no minimum on card.",
          "The almond croissants are weekends only and they do go by about eleven.",
        ],
      },
      {
        type: "p",
        text: "That is genuinely all of it. If you are not sure what to order, say what you normally drink and someone behind the bar will point you at the nearest thing we make.",
      },
    ],
    comments: [
      {
        author: "Nico",
        date: "6 January 2026",
        body: "The plug socket note should be on a sign by the door, honestly. Took me three visits to work that out.",
      },
    ],
  },
  {
    slug: "the-new-grinder",
    title: "The new grinder, and why the queue got shorter",
    date: "8 December 2025",
    category: "Coffee",
    tags: ["espresso", "single origin"],
    excerpt:
      "We replaced the grinder in November. The coffee is a little more consistent and the morning queue is about two minutes faster.",
    body: [
      {
        type: "p",
        text: "We replaced the espresso grinder in November. It was not a dramatic upgrade — same category of machine, just newer — but two things changed noticeably.",
      },
      {
        type: "p",
        text: "The first is consistency. Shot-to-shot variation is smaller, which mostly means the tenth flat white of the morning tastes like the first one did. The second is speed: it doses faster and retains less, so the person behind the bar is not purging between drinks.",
      },
      {
        type: "p",
        text: "Between the two, the morning queue is running about two minutes shorter than it was. If you used to arrive at half seven to beat it, you probably no longer need to.",
      },
    ],
    comments: [],
  },
];

export const POSTS_PER_PAGE = 3;

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

/** Category counts, derived rather than hand-maintained. */
export const categories = Array.from(
  posts.reduce((map, post) => {
    map.set(post.category, (map.get(post.category) ?? 0) + 1);
    return map;
  }, new Map<string, number>()),
).map(([label, count]) => ({ label, count, href: `${BASE}/blog` }));

export const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)));
