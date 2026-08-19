"use client";

/**
 * The home page's opening: four books, turned by the scrollbar.
 *
 * The whole run of work is one continuous scroll. Each project is its own
 * clothbound volume — it comes forward, its cover swings open, its pages turn
 * one at a time, it closes and recedes, and the next one takes its place. The
 * last page of the last book is the end of the scroll; there is no closing
 * animation after it, because there is nothing left to go back to.
 *
 * The shelf demo at /work/bindery is click-driven and stateful. This is the
 * opposite and deliberately simpler — there is no state machine at all. Scroll
 * position maps straight to which book is up, how far its cover has swung and
 * how far each page has turned, so a frame is a pure function of
 * `progressThrough(section)`. Scrub backwards and it runs backwards exactly:
 * pages un-turn, covers re-close, books come back. Nothing is remembered
 * between frames, so there is nothing to fall out of sync.
 *
 * It subscribes to the shared scroll engine in `lib/scroll` rather than adding
 * its own listener, so this scene costs the page nothing extra per frame.
 *
 * Three things it refuses to do:
 *   - Pin under reduced motion. A scrubbed pin is the one effect that setting
 *     most clearly asks you not to build, so that path renders a static hero.
 *   - Be the only copy of the content. Every project title and blurb is in the
 *     server HTML, and the projects gallery further down the page is untouched.
 *   - Download Three.js speculatively. Both checks run before the import.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type * as ThreeNamespace from "three";

import type { Book } from "./book";
import { writtenVolumes } from "./volumes";
import { clamp01, prefersReducedMotion, progressThrough, subscribeScroll } from "@/lib/scroll";

/** Vertical field of view, matching the shelf demo. */
const V_FOV = 38;
/** How far the cover swings when fully open. */
const COVER_OPEN = Math.PI * 0.92;

/**
 * Where each phase of a single book's turn sits inside its slice of the
 * scroll. The last book's page run continues to the very end instead of
 * stopping at `PAGES_END` — reaching its final page is the end of the scroll.
 */
const ENTER_END = 0.1;
const OPEN_END = 0.26;
const PAGES_END = 0.88;

/** Screens of scroll each book gets. Five beats fit comfortably in two. */
const SCREENS_PER_BOOK = 2;

function supportsWebGL() {
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"));
  } catch {
    return false;
  }
}

const smooth = (t: number) => t * t * (3 - 2 * t);
/** Maps `value` from [a,b] onto [0,1], clamped and eased. */
const between = (value: number, a: number, b: number) => smooth(clamp01((value - a) / (b - a)));

/** Which book is up, and how far through its own sequence the scroll is. */
function locate(p: number, count: number) {
  const span = 1 / count;
  const index = Math.min(count - 1, Math.max(0, Math.floor(p / span)));
  return { index, q: clamp01((p - index * span) / span), isLast: index === count - 1 };
}

export function ScrollBook() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [live, setLive] = useState(false);
  /** Which book is showing, and which of its pages. -1 = not open yet. */
  const [at, setAt] = useState({ book: 0, page: -1 });
  /** The reader has asked for the scene despite a reduced-motion preference. */
  const [forced, setForced] = useState(false);
  /** Why the scene is not running, when the reader asks for it and it cannot. */
  const [note, setNote] = useState<string | null>(null);

  const count = writtenVolumes.length;

  // Set from a click, never from an effect, so this stays a plain event
  // handler and the capability checks stay on the client where they belong.
  const play = () => {
    if (!supportsWebGL()) {
      setNote(
        "This browser has WebGL switched off, so the books cannot be drawn here. Every one of them is listed below, and the case studies are unaffected.",
      );
      return;
    }
    setForced(true);
  };

  useEffect(() => {
    const mount = mountRef.current;
    const section = sectionRef.current;
    if (!mount || !section) return;
    // Checked before the import, not after: a reader with reduced motion on,
    // or a browser without a GL context, must never download Three.js at all.
    // This is the front page — most of its visitors should pay nothing for a
    // scene they are not going to be shown.
    //
    // `forced` is the reader overriding the reduced-motion default from the
    // button below. Respecting the setting silently is correct and also
    // baffling: a machine with "reduce motion" on — which a laptop can pick up
    // from a battery saver without anyone choosing it — showed a text list
    // where the same person's phone showed the books, with nothing on the page
    // to explain the difference. The setting still decides the default; it no
    // longer decides the ceiling.
    if ((prefersReducedMotion() && !forced) || !supportsWebGL()) return;

    let cancelled = false;
    let teardown: (() => void) | null = null;

    const start = (
      THREE: typeof import("three"),
      { bendSheet, createBook, fitDistance, sheetRestAngle }: typeof import("./book"),
      {
        makeBookMaps,
        makeContactShadowTexture,
        makeProjectPageTexture,
        makeSpreadTexture,
      }: typeof import("./textures"),
    ) => {
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.shadowMap.enabled = true;
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.display = "block";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        V_FOV,
        mount.clientWidth / Math.max(1, mount.clientHeight),
        0.1,
        60,
      );

      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const key = new THREE.DirectionalLight(0xfff3e2, 2.2);
      key.position.set(2.6, 4.4, 5.2);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 1;
      key.shadow.camera.far = 20;
      key.shadow.bias = -0.0012;
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xdbe6ff, 0.55);
      fill.position.set(-4.2, 1.8, 3);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xffd9a8, 0.6);
      rim.position.set(-1.2, 2.6, -4.6);
      scene.add(rim);

      const contact = makeContactShadowTexture();

      // Books are built on demand rather than all four up front. This is the
      // landing page: the first book has to be on screen quickly, and three
      // more sets of procedurally drawn cloth, foil and paper is a long stall
      // for volumes the reader may never scroll to. The next one is prepared
      // one book ahead, which is far enough to never be caught out.
      const built: (Book | null)[] = writtenVolumes.map(() => null);
      const ensure = (index: number) => {
        if (index < 0 || index >= writtenVolumes.length) return null;
        const existing = built[index];
        if (existing) return existing;

        const volume = writtenVolumes[index];
        // Its own project page first, then the volume's own spreads.
        const faces = [
          makeProjectPageTexture(volume, volume, index, writtenVolumes.length),
          ...volume.spreads.map((_, spread) => makeSpreadTexture(volume, spread)),
        ];
        const book = createBook(volume, makeBookMaps(volume), faces);
        (book.shadow.material as ThreeNamespace.MeshBasicMaterial).map = contact;
        (book.shadow.material as ThreeNamespace.MeshBasicMaterial).needsUpdate = true;
        book.group.visible = false;
        scene.add(book.group);
        built[index] = book;
        return book;
      };

      let disposed = false;
      let painted = false;
      let dirty = true;
      let progress = 0;
      let announced = { book: -1, page: -2 };

      const resize = () => {
        const width = mount.clientWidth;
        const height = Math.max(1, mount.clientHeight);
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        dirty = true;
      };
      const observer = new ResizeObserver(resize);
      observer.observe(mount);

      const unsubscribe = subscribeScroll(() => {
        const next = progressThrough(section);
        if (next !== progress) {
          progress = next;
          dirty = true;
        }
      });

      const focus = new THREE.Vector3();

      const frame = () => {
        if (disposed) return;
        requestAnimationFrame(frame);
        if (!dirty) return;
        dirty = false;

        const { index, q, isLast } = locate(progress, writtenVolumes.length);
        const book = ensure(index);
        if (!book) return;
        ensure(index + 1);

        // Only the book being read is drawn. The others are moved out of the
        // scene graph's way rather than faded, which would need every material
        // to be transparent for the whole scroll to save one moment of it.
        for (let i = 0; i < built.length; i += 1) {
          const other = built[i];
          if (other) other.group.visible = i === index;
        }

        const pagesEnd = isLast ? 1 : PAGES_END;
        const enter = between(q, 0, ENTER_END);
        const open = between(q, ENTER_END, OPEN_END);
        const exit = isLast ? 0 : between(q, pagesEnd, 1);
        const through = clamp01((q - OPEN_END) / (pagesEnd - OPEN_END));

        // A cover that has opened and is now closing again on the way out.
        const cover = open * (1 - exit) * COVER_OPEN;
        book.coverPivot.rotation.y = -cover;

        // Pages turn one at a time, each over its own slice of the run. The
        // last sheet is never turned — there is nothing printed behind it.
        const turns = Math.max(1, book.sheets.length - 1);
        const reached = through * turns;
        for (let i = 0; i < book.sheets.length; i += 1) {
          const turn = i < turns ? smooth(clamp01(reached - i)) : 0;
          bendSheet(book.sheets[i], turn, sheetRestAngle(cover, i));
          book.sheets[i].pivot.visible = cover > 0.05;
        }

        // Coming forward, then receding as the next volume takes over.
        const away = 1 - enter + exit;
        book.group.rotation.y = -0.42 + open * 0.34 - away * 0.55;
        book.group.rotation.x = open * 0.06;
        book.group.position.z = -away * 1.4;
        book.group.scale.setScalar(1 - away * 0.16);

        const size = book.size;
        const wide = mount.clientWidth >= 900;

        // A portrait viewport cannot frame a whole open spread and still leave
        // the book a readable size — fitting the full width puts the camera
        // three times further back than the height needs, and the book ends up
        // a stamp in the middle of an empty screen. So a narrow screen frames
        // the page you are actually reading and lets the rest run off frame,
        // the way you would hold a book on a phone. The height factor is
        // margin: a page mid-turn bows out of the book's resting box.
        const distance =
          fitDistance(
            size.width * (1 + open * (wide ? 1.5 : 0.25)),
            size.height * (wide ? 1.5 : 1.22),
            camera.aspect,
            V_FOV,
          ) * (wide ? 1.12 : 1.04);

        // Aim off-centre so the caption has a corner to itself — sideways on a
        // wide viewport where the panel is docked bottom-left, upward on a
        // narrow one where it sits underneath.
        const biasX = wide ? -distance * 0.14 * open : 0;
        const biasY = wide ? 0 : -distance * 0.07 * open;

        // Wide: centre the spread, which drifts left as the cover swings out.
        // Narrow: follow the recto instead, since that is the page in frame.
        focus.set(open * size.width * (wide ? -0.42 : 0.16), 0, 0);
        camera.position.set(focus.x + 0.1, focus.y + 0.35, distance);
        camera.lookAt(focus.x + biasX, focus.y + biasY, 0);

        renderer.render(scene, camera);

        // The caption is React state, so it is only pushed when the reader
        // actually arrives at a different page — not on every scroll frame.
        const page = cover > 0.05 ? Math.min(turns, Math.floor(reached + 0.5)) : -1;
        if (announced.book !== index || announced.page !== page) {
          announced = { book: index, page };
          setAt({ book: index, page });
        }

        if (!painted) {
          painted = true;
          setLive(true);
        }
      };

      frame();

      return () => {
        disposed = true;
        observer.disconnect();
        unsubscribe();
        for (const book of built) book?.dispose();
        contact.dispose();
        renderer.dispose();
        scene.clear();
        if (renderer.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement);
        }
      };
    };

    void Promise.all([import("three"), import("./book"), import("./textures")]).then(
      ([three, bookModule, textureModule]) => {
        if (cancelled) return;
        teardown = start(three, bookModule, textureModule);
      },
    );

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [count, forced]);

  const volume = writtenVolumes[at.book];
  const spread = at.page > 0 ? volume?.spreads[at.page - 1] : null;

  return (
    <section
      ref={sectionRef}
      // Two screens of scroll per book, plus a screen of run-out. Under reduced
      // motion the inline style is not applied and this collapses to an
      // ordinary-height hero.
      style={live ? { height: `${count * SCREENS_PER_BOOK * 100 + 100}vh` } : undefined}
      className="border-line relative border-b"
      aria-label="Selected work"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />

        {/* Static hero. Stays put when the scene never starts. */}
        {!live && (
          <div className="relative mx-auto w-full max-w-[88rem] px-5 py-20 sm:px-8">
            <p className="text-muted text-[11px] font-medium tracking-[0.18em] uppercase">
              Selected work
            </p>
            <h2 className="mt-3 max-w-3xl font-serif text-3xl leading-tight sm:text-5xl">
              Four projects, each a working site rather than a screenshot.
            </h2>
            <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {writtenVolumes.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href ?? "/projects"}
                    className="group flex items-baseline gap-3 py-1"
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: item.cloth }}
                      aria-hidden
                    />
                    <span className="font-serif text-lg group-hover:underline">
                      {item.title}
                    </span>
                    <span className="text-muted text-xs">{item.subtitle}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/*
              The way out of the reduced-motion default. It is an opt-in rather
              than the other way round: the setting is honoured until someone
              says otherwise, and a reader who never presses this keeps a page
              with no pinned scrubbing on it at all.
            */}
            <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-2">
              <button
                type="button"
                onClick={play}
                className="border-line-strong hover:border-accent hover:text-accent inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors"
              >
                Turn the pages
              </button>
              <p className="text-ink-3 text-xs">
                The books are held back because this device asks for reduced motion.
              </p>
            </div>

            {note && (
              <p className="text-ink-3 mt-3 max-w-prose text-xs leading-relaxed" role="status">
                {note}
              </p>
            )}
          </div>
        )}

        {/*
          Caption over the live scene. Absolutely placed rather than laid out
          in the flex column: the sticky parent centres its children, so a
          flow-positioned caption lands in the middle of the screen on top of
          the book instead of underneath it.
        */}
        {live && volume && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto w-full max-w-[88rem] px-5 pb-10 sm:px-8">
            <p className="sr-only" role="status" aria-live="polite">
              {volume.title}
              {spread ? `. ${spread.heading}.` : ". "}
            </p>

            <div className="pointer-events-auto max-w-sm rounded-xl bg-black/75 p-4 text-white backdrop-blur-sm">
              <p
                className="text-[11px] font-medium tracking-[0.14em] uppercase"
                style={{ color: volume.foil ?? "#cfcabb" }}
              >
                {String(at.book + 1).padStart(2, "0")} / {String(count).padStart(2, "0")} ·{" "}
                {volume.year}
              </p>
              <h2 className="mt-1 font-serif text-xl leading-tight">{volume.title}</h2>
              <p className="mt-0.5 text-xs text-white/60">
                {spread ? spread.heading : volume.subtitle}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Link
                  href={volume.href ?? "/projects"}
                  className="inline-flex rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-black transition hover:bg-white/90"
                >
                  Read the case study
                </Link>
                <span className="text-[10px] text-white/40">
                  {at.page < 0 ? "Scroll to open" : `Page ${at.page + 1}`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
