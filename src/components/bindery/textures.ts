/**
 * Every surface in the scene is drawn at runtime into a canvas. Nothing here
 * is a downloaded image, so the whole demo adds no network requests beyond the
 * route's own JavaScript.
 *
 * Foil is faked with three maps rather than a second mesh: the stamp is drawn
 * in its own colour on the colour map, and a matching black-and-white mask is
 * handed to `metalnessMap` and `roughnessMap`. The cloth stays rough and dead
 * while the stamped areas alone pick up the studio lights, which is what foil
 * actually does.
 */
import * as THREE from "three";

import { isUnwritten, type Volume } from "./volumes";

/** Deterministic RNG — the same seed always draws the same book. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TITLE_FONT = 'Georgia, "Times New Roman", serif';
const LABEL_FONT = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

function canvas(width: number, height: number) {
  const element = document.createElement("canvas");
  element.width = width;
  element.height = height;
  const context = element.getContext("2d");
  if (!context) throw new Error("2D canvas context unavailable");
  return { element, context };
}

function finish(element: HTMLCanvasElement, srgb: boolean) {
  const texture = new THREE.CanvasTexture(element);
  texture.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

/** Woven cloth: two crossing sets of slightly irregular threads. */
function drawWeave(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  random: () => number,
  strength: number,
) {
  const pitch = 4;
  context.globalAlpha = strength;
  for (let x = 0; x < width; x += pitch) {
    context.fillStyle = random() > 0.5 ? "#ffffff" : "#000000";
    context.fillRect(x, 0, 1 + random(), height);
  }
  for (let y = 0; y < height; y += pitch) {
    context.fillStyle = random() > 0.5 ? "#ffffff" : "#000000";
    context.fillRect(0, y, width, 1 + random());
  }
  context.globalAlpha = 1;
}

/** Fibre noise — the flecks that stop a flat fill reading as plastic. */
function drawFleck(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  random: () => number,
  count: number,
  alpha: number,
) {
  for (let i = 0; i < count; i += 1) {
    context.fillStyle = random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
    context.fillRect(random() * width, random() * height, 1, 1);
  }
}

/**
 * The abstract mark stamped on each cover. Four families, chosen by seed, all
 * built from arcs and rules — no motif represents a real logo or publisher.
 */
function drawMotif(
  context: CanvasRenderingContext2D,
  volume: Volume,
  x: number,
  y: number,
  size: number,
) {
  const random = rng(volume.seed);
  const family = volume.seed % 4;
  context.save();
  context.translate(x, y);
  context.lineWidth = Math.max(2, size * 0.022);
  context.lineCap = "butt";

  if (family === 0) {
    // Concentric arcs, each one stopping short of the last.
    for (let i = 0; i < 6; i += 1) {
      const radius = (size / 2) * (1 - i * 0.14);
      const start = random() * Math.PI * 2;
      context.beginPath();
      context.arc(0, 0, radius, start, start + Math.PI * (0.7 + random() * 0.8));
      context.stroke();
    }
  } else if (family === 1) {
    // A ruled field with a single interrupted band.
    const gap = size / 11;
    for (let i = 0; i < 11; i += 1) {
      const yy = -size / 2 + i * gap;
      const inset = i === 5 ? size * 0.22 : 0;
      context.beginPath();
      context.moveTo(-size / 2 + inset, yy);
      context.lineTo(size / 2 - inset, yy);
      context.stroke();
    }
  } else if (family === 2) {
    // Nested squares rotated off true.
    for (let i = 0; i < 5; i += 1) {
      const side = size * (1 - i * 0.17);
      context.save();
      context.rotate((i - 2) * 0.045);
      context.strokeRect(-side / 2, -side / 2, side, side);
      context.restore();
    }
  } else {
    // A half-filled circle over a rule — a sun over a horizon, roughly.
    context.beginPath();
    context.arc(0, -size * 0.06, size * 0.34, Math.PI, 0);
    context.stroke();
    context.beginPath();
    context.moveTo(-size / 2, size * 0.16);
    context.lineTo(size / 2, size * 0.16);
    context.stroke();
    for (let i = 0; i < 4; i += 1) {
      const yy = size * (0.24 + i * 0.06);
      const half = (size / 2) * (1 - i * 0.18);
      context.beginPath();
      context.moveTo(-half, yy);
      context.lineTo(half, yy);
      context.stroke();
    }
  }
  context.restore();
}

/** Wrap text to a pixel width, returning the lines it broke into. */
function wrap(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) return lines;
    } else {
      line = next;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

function letterspace(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
) {
  const total = context.measureText(text).width + spacing * Math.max(0, text.length - 1);
  let cursor = x - total / 2;
  for (const character of text) {
    context.fillText(character, cursor + context.measureText(character).width / 2, y);
    cursor += context.measureText(character).width + spacing;
  }
}

export type BookMaps = {
  front: THREE.Texture;
  frontStamp: THREE.Texture;
  back: THREE.Texture;
  backStamp: THREE.Texture;
  spine: THREE.Texture;
  spineStamp: THREE.Texture;
  cloth: THREE.Texture;
  endpaper: THREE.Texture;
  pageFace: THREE.Texture;
  edges: THREE.Texture;
  dispose: () => void;
};

const COVER_W = 512;
const COVER_H = 720;

/**
 * Draws front, back and spine artwork plus their foil masks.
 *
 * The stamp mask is the load-bearing piece: white where foil sits, black
 * everywhere else. It goes to `metalnessMap` so only the stamp is metal, and
 * — inverted by the material's `roughness` scaling — keeps the cloth matte.
 */
function drawCoverPair(
  volume: Volume,
  width: number,
  height: number,
  paint: (context: CanvasRenderingContext2D, foil: string, stamp: boolean) => void,
) {
  const art = canvas(width, height);
  const mask = canvas(width, height);
  const random = rng(volume.seed);

  art.context.fillStyle = volume.cloth;
  art.context.fillRect(0, 0, width, height);
  drawWeave(art.context, width, height, random, 0.06);
  drawFleck(art.context, width, height, random, width * 6, 0.05);

  mask.context.fillStyle = "#000000";
  mask.context.fillRect(0, 0, width, height);

  if (!isUnwritten(volume) && volume.foil) {
    paint(art.context, volume.foil, false);
    paint(mask.context, "#ffffff", true);
  }

  return {
    art: finish(art.element, true),
    mask: finish(mask.element, false),
  };
}

export function makeBookMaps(volume: Volume): BookMaps {
  const random = rng(volume.seed + 17);

  // ---- Front board -------------------------------------------------------
  const front = drawCoverPair(volume, COVER_W, COVER_H, (context, foil) => {
    context.fillStyle = foil;
    context.strokeStyle = foil;
    context.textAlign = "center";
    context.textBaseline = "middle";

    drawMotif(context, volume, COVER_W / 2, COVER_H * 0.34, COVER_W * 0.42);

    context.font = `500 ${COVER_W * 0.075}px ${TITLE_FONT}`;
    const titleLines = wrap(context, volume.title, COVER_W * 0.76, 2);
    titleLines.forEach((line, index) => {
      context.fillText(line, COVER_W / 2, COVER_H * 0.63 + index * COVER_W * 0.095);
    });

    context.font = `400 ${COVER_W * 0.032}px ${LABEL_FONT}`;
    const subLines = wrap(context, volume.subtitle, COVER_W * 0.66, 2);
    subLines.forEach((line, index) => {
      context.globalAlpha = 0.85;
      context.fillText(
        line,
        COVER_W / 2,
        COVER_H * 0.63 + titleLines.length * COVER_W * 0.095 + index * COVER_W * 0.045,
      );
      context.globalAlpha = 1;
    });

    // Rule and year at the foot.
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(COVER_W * 0.34, COVER_H * 0.87);
    context.lineTo(COVER_W * 0.66, COVER_H * 0.87);
    context.stroke();
    context.font = `500 ${COVER_W * 0.028}px ${LABEL_FONT}`;
    letterspace(context, volume.year, COVER_W / 2, COVER_H * 0.91, COVER_W * 0.012);
  });

  // ---- Back board --------------------------------------------------------
  // Drawn upright. The mesh's UVs put it the right way round, so nothing here
  // is mirrored — a back cover with reversed text is the classic tell.
  const back = drawCoverPair(volume, COVER_W, COVER_H, (context, foil) => {
    context.fillStyle = foil;
    context.strokeStyle = foil;
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.font = `400 ${COVER_W * 0.03}px ${LABEL_FONT}`;
    context.globalAlpha = 0.8;
    const lines = wrap(context, volume.blurb, COVER_W * 0.7, 7);
    lines.forEach((line, index) => {
      context.fillText(line, COVER_W / 2, COVER_H * 0.3 + index * COVER_W * 0.05);
    });
    context.globalAlpha = 1;

    context.lineWidth = 1.5;
    context.beginPath();
    context.arc(COVER_W / 2, COVER_H * 0.74, COVER_W * 0.055, 0, Math.PI * 2);
    context.stroke();
    context.font = `500 ${COVER_W * 0.05}px ${TITLE_FONT}`;
    context.fillText("E", COVER_W / 2, COVER_H * 0.744);
  });

  // ---- Spine -------------------------------------------------------------
  const SPINE_W = 256;
  const SPINE_H = 1024;
  const spine = drawCoverPair(volume, SPINE_W, SPINE_H, (context, foil) => {
    context.fillStyle = foil;
    context.strokeStyle = foil;
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.lineWidth = 2;
    for (const y of [SPINE_H * 0.08, SPINE_H * 0.115, SPINE_H * 0.885, SPINE_H * 0.92]) {
      context.beginPath();
      context.moveTo(SPINE_W * 0.26, y);
      context.lineTo(SPINE_W * 0.74, y);
      context.stroke();
    }

    // Rotated so the title reads top-to-bottom on a shelved book.
    context.save();
    context.translate(SPINE_W / 2, SPINE_H / 2);
    context.rotate(Math.PI / 2);
    context.font = `500 ${SPINE_W * 0.3}px ${TITLE_FONT}`;
    context.fillText(volume.spine, 0, 0, SPINE_H * 0.62);
    context.restore();

    context.font = `500 ${SPINE_W * 0.11}px ${LABEL_FONT}`;
    letterspace(context, volume.year, SPINE_W / 2, SPINE_H * 0.955, SPINE_W * 0.03);
  });

  // ---- Cloth bump --------------------------------------------------------
  const clothCanvas = canvas(256, 256);
  clothCanvas.context.fillStyle = "#808080";
  clothCanvas.context.fillRect(0, 0, 256, 256);
  drawWeave(clothCanvas.context, 256, 256, rng(volume.seed + 3), 0.5);
  drawFleck(clothCanvas.context, 256, 256, rng(volume.seed + 4), 4000, 0.25);
  const cloth = finish(clothCanvas.element, false);
  cloth.wrapS = THREE.RepeatWrapping;
  cloth.wrapT = THREE.RepeatWrapping;
  cloth.repeat.set(3, 4);

  // ---- Endpaper ----------------------------------------------------------
  const endCanvas = canvas(256, 360);
  endCanvas.context.fillStyle = volume.cloth;
  endCanvas.context.fillRect(0, 0, 256, 360);
  endCanvas.context.globalAlpha = 0.55;
  endCanvas.context.fillStyle = volume.paper;
  endCanvas.context.fillRect(0, 0, 256, 360);
  endCanvas.context.globalAlpha = 1;
  drawFleck(endCanvas.context, 256, 360, rng(volume.seed + 5), 6000, 0.06);
  const endpaper = finish(endCanvas.element, true);

  // ---- Page face ---------------------------------------------------------
  const pageCanvas = canvas(512, 720);
  pageCanvas.context.fillStyle = volume.paper;
  pageCanvas.context.fillRect(0, 0, 512, 720);
  drawFleck(pageCanvas.context, 512, 720, random, 14000, 0.05);
  const pageFace = finish(pageCanvas.element, true);

  // ---- Page-edge striping ------------------------------------------------
  const edgeCanvas = canvas(256, 64);
  edgeCanvas.context.fillStyle = volume.paper;
  edgeCanvas.context.fillRect(0, 0, 256, 64);
  const edgeRandom = rng(volume.seed + 6);
  for (let x = 0; x < 256; x += 1) {
    const shade = 0.06 + edgeRandom() * 0.16;
    edgeCanvas.context.fillStyle = `rgba(60,44,30,${shade})`;
    edgeCanvas.context.fillRect(x, 0, 1, 64);
  }
  const edges = finish(edgeCanvas.element, true);

  const all = [
    front.art,
    front.mask,
    back.art,
    back.mask,
    spine.art,
    spine.mask,
    cloth,
    endpaper,
    pageFace,
    edges,
  ];

  return {
    front: front.art,
    frontStamp: front.mask,
    back: back.art,
    backStamp: back.mask,
    spine: spine.art,
    spineStamp: spine.mask,
    cloth,
    endpaper,
    pageFace,
    edges,
    dispose: () => all.forEach((texture) => texture.dispose()),
  };
}

/** A printed spread — running head, rule, text block, folio. */
export function makeSpreadTexture(volume: Volume, index: number) {
  const spread = volume.spreads[index];
  const { element, context } = canvas(512, 720);
  context.fillStyle = volume.paper;
  context.fillRect(0, 0, 512, 720);
  drawFleck(context, 512, 720, rng(volume.seed + index * 31), 12000, 0.05);

  if (spread) {
    context.fillStyle = volume.ink;
    context.textAlign = "left";
    context.textBaseline = "alphabetic";

    context.globalAlpha = 0.55;
    context.font = `500 ${16}px ${LABEL_FONT}`;
    context.fillText(spread.heading.toUpperCase(), 64, 96);
    context.globalAlpha = 1;

    context.fillRect(64, 116, 384, 1);

    context.font = `400 ${23}px ${TITLE_FONT}`;
    const lines = wrap(context, spread.body, 384, 14);
    lines.forEach((line, i) => context.fillText(line, 64, 170 + i * 36));

    context.globalAlpha = 0.5;
    context.font = `400 ${15}px ${LABEL_FONT}`;
    context.textAlign = "center";
    context.fillText(String(index * 2 + 3), 256, 660);
    context.globalAlpha = 1;
  }

  return finish(element, true);
}

/**
 * A project page for the compilation volume on the home page.
 *
 * Laid out as a real book page rather than reusing the generic spread: a folio
 * number, the project's own accent as a rule, its title set large, the
 * subtitle beneath, then the body. Each page carries the colour of the project
 * it describes, so turning through the book walks the palette of the work.
 */
export function makeProjectPageTexture(
  host: Volume,
  project: Volume,
  index: number,
  total: number,
) {
  const { element, context } = canvas(512, 720);
  context.fillStyle = host.paper;
  context.fillRect(0, 0, 512, 720);
  drawFleck(context, 512, 720, rng(host.seed + index * 71), 12000, 0.05);

  context.textAlign = "left";
  context.textBaseline = "alphabetic";

  // Folio and running head.
  context.fillStyle = host.ink;
  context.globalAlpha = 0.45;
  context.font = `500 14px ${LABEL_FONT}`;
  context.fillText(
    `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`,
    64,
    92,
  );
  context.textAlign = "right";
  context.fillText(project.year, 448, 92);
  context.globalAlpha = 1;
  context.textAlign = "left";

  // The project's own colour, as a stamped rule.
  context.fillStyle = project.cloth;
  context.fillRect(64, 116, 96, 5);

  // Title.
  context.fillStyle = host.ink;
  context.font = `500 38px ${TITLE_FONT}`;
  const title = wrap(context, project.title, 384, 2);
  title.forEach((line, i) => context.fillText(line, 64, 186 + i * 46));

  // Subtitle.
  context.globalAlpha = 0.6;
  context.font = `400 17px ${LABEL_FONT}`;
  const sub = wrap(context, project.subtitle, 384, 2);
  sub.forEach((line, i) => context.fillText(line, 64, 232 + title.length * 46 + i * 24));
  context.globalAlpha = 1;

  // Body.
  context.font = `400 21px ${TITLE_FONT}`;
  const bodyTop = 292 + title.length * 46 + sub.length * 24;
  wrap(context, project.blurb, 384, 12).forEach((line, i) =>
    context.fillText(line, 64, bodyTop + i * 33),
  );

  // Footer cue — the HTML panel carries the real link; this is the printed
  // equivalent, so a screenshot of the page still says where to go.
  context.globalAlpha = 0.45;
  context.font = `500 13px ${LABEL_FONT}`;
  context.fillText("READ THE CASE STUDY →", 64, 656);
  context.globalAlpha = 1;

  return finish(element, true);
}

/** The title page, shown first when a book opens. */
export function makeTitlePageTexture(volume: Volume) {
  const { element, context } = canvas(512, 720);
  context.fillStyle = volume.paper;
  context.fillRect(0, 0, 512, 720);
  drawFleck(context, 512, 720, rng(volume.seed + 99), 12000, 0.05);

  context.fillStyle = volume.ink;
  context.textAlign = "center";
  context.textBaseline = "middle";

  if (isUnwritten(volume)) {
    context.globalAlpha = 0.4;
    context.font = `400 ${22}px ${TITLE_FONT}`;
    context.fillText("This volume is unwritten", 256, 348);
    context.font = `400 ${15}px ${LABEL_FONT}`;
    context.fillText(volume.subtitle, 256, 384);
    context.globalAlpha = 1;
    return finish(element, true);
  }

  context.font = `500 ${40}px ${TITLE_FONT}`;
  wrap(context, volume.title, 380, 2).forEach((line, index) => {
    context.fillText(line, 256, 286 + index * 50);
  });

  context.globalAlpha = 0.65;
  context.font = `400 ${17}px ${LABEL_FONT}`;
  wrap(context, volume.subtitle, 340, 2).forEach((line, index) => {
    context.fillText(line, 256, 372 + index * 26);
  });
  context.globalAlpha = 1;

  context.fillRect(206, 438, 100, 1);

  context.globalAlpha = 0.5;
  context.font = `400 ${14}px ${LABEL_FONT}`;
  context.fillText(volume.binding, 256, 476);
  context.fillText(`ECOmissions · ${volume.year}`, 256, 500);
  context.globalAlpha = 1;

  return finish(element, true);
}

/** Shelf timber. Grain runs along the board. */
export function makeWoodTexture() {
  const { element, context } = canvas(1024, 256);
  const random = rng(8801);
  context.fillStyle = "#5b4130";
  context.fillRect(0, 0, 1024, 256);
  for (let i = 0; i < 220; i += 1) {
    const y = random() * 256;
    const height = 1 + random() * 3;
    const shade = random() * 0.16;
    context.fillStyle =
      random() > 0.5 ? `rgba(255,225,190,${shade})` : `rgba(20,10,4,${shade})`;
    context.beginPath();
    context.moveTo(0, y);
    context.bezierCurveTo(
      256,
      y + (random() - 0.5) * 22,
      768,
      y + (random() - 0.5) * 22,
      1024,
      y,
    );
    context.lineWidth = height;
    context.strokeStyle = context.fillStyle;
    context.stroke();
  }
  drawFleck(context, 1024, 256, random, 24000, 0.05);
  const texture = finish(element, true);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/** Soft elliptical blob used as a contact shadow under each volume. */
export function makeContactShadowTexture() {
  const { element, context } = canvas(256, 256);
  const gradient = context.createRadialGradient(128, 128, 4, 128, 128, 124);
  gradient.addColorStop(0, "rgba(0,0,0,0.55)");
  gradient.addColorStop(0.55, "rgba(0,0,0,0.22)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  return finish(element, true);
}
