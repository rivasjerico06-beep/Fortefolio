"use client";

/**
 * The home page's opening: one book, turned by the scrollbar.
 *
 * The shelf demo at /work/bindery is click-driven and stateful. This is the
 * opposite and deliberately simpler — there is no state machine at all. Scroll
 * position maps straight to cover angle and page rotation, so the scene is a
 * pure function of `progressThrough(section)`. Scrub backwards and it runs
 * backwards exactly; there is nothing to get out of sync because nothing is
 * remembered between frames.
 *
 * It subscribes to the shared scroll engine in `lib/scroll` rather than adding
 * its own listener, so this scene costs the page nothing extra per frame.
 *
 * Three things it refuses to do:
 *   - Pin under reduced motion. A scrubbed pin is the one effect that setting
 *     most clearly asks you not to build, so that path renders a static hero.
 *   - Be the only copy of the content. Every project title and blurb is in the
 *     server HTML underneath, and the projects gallery further down the page
 *     is untouched.
 *   - Load at all without WebGL. Same fallback as reduced motion.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import type * as ThreeNamespace from "three";

import type { Book } from "./book";
import { portfolioVolume, writtenVolumes } from "./volumes";
import { clamp01, prefersReducedMotion, progressThrough, subscribeScroll } from "@/lib/scroll";

/** Vertical field of view, matching the shelf demo. */
const V_FOV = 38;
/** Scroll fractions: cover opens, then pages turn, then the last page holds. */
const OPEN_FROM = 0.06;
const OPEN_TO = 0.2;
const PAGES_TO = 0.93;
/** How far the cover swings when fully open. */
const COVER_OPEN = Math.PI * 0.92;

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

export function ScrollBook() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [live, setLive] = useState(false);
  const [active, setActive] = useState(-1);

  // Turns needed to reach the last project: one off the title page, then one
  // per project after the first.
  const turns = writtenVolumes.length;

  useEffect(() => {
    const mount = mountRef.current;
    const section = sectionRef.current;
    if (!mount || !section) return;
    // Checked before the import, not after: a reader with reduced motion on,
    // or a browser without a GL context, must never download Three.js at all.
    // This is the front page — most of its visitors should pay nothing for a
    // scene they are not going to be shown.
    if (prefersReducedMotion() || !supportsWebGL()) return;

    let cancelled = false;
    let teardown: (() => void) | null = null;

    const start = (
      THREE: typeof import("three"),
      { bendSheet, createBook, fitDistance }: typeof import("./book"),
      {
        makeBookMaps,
        makeContactShadowTexture,
        makeProjectPageTexture,
        makeTitlePageTexture,
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

      // The compilation volume: a title page, then one page per project.
      const maps = makeBookMaps(portfolioVolume);
      const faces = [
        makeTitlePageTexture(portfolioVolume),
        ...writtenVolumes.map((project, index) =>
          makeProjectPageTexture(portfolioVolume, project, index, writtenVolumes.length),
        ),
      ];
      const book: Book = createBook(portfolioVolume, maps, faces);
      const contact = makeContactShadowTexture();
      (book.shadow.material as ThreeNamespace.MeshBasicMaterial).map = contact;
      (book.shadow.material as ThreeNamespace.MeshBasicMaterial).needsUpdate = true;
      scene.add(book.group);

      let disposed = false;
      let painted = false;
      let dirty = true;
      let progress = 0;

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

        const p = progress;
        const openness = between(p, OPEN_FROM, OPEN_TO);
        const cover = openness * COVER_OPEN;
        book.coverPivot.rotation.y = -cover;

        // Pages. Each sheet gets its own slice of the scroll, and they overlap
        // slightly so one page is lifting as the last settles.
        const pageSpan = (PAGES_TO - OPEN_TO) / turns;
        for (let i = 0; i < book.sheets.length; i += 1) {
          const start = OPEN_TO + i * pageSpan;
          const turn = i < turns ? between(p, start, start + pageSpan * 1.25) : 0;
          bendSheet(book.sheets[i], turn * (cover / Math.PI));
          book.sheets[i].pivot.visible = cover > 0.05;
        }

        // The book lies flatter and turns to face the reader as it opens, then
        // holds. A closed book angled slightly is a better hero than a flat one.
        book.group.rotation.y = -0.42 + openness * 0.34;
        book.group.rotation.x = openness * 0.06;
        book.group.position.y = 0;

        const size = portfolioVolume.size;
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
            size.width * (1 + openness * (wide ? 1.5 : 0.25)),
            size.height * (wide ? 1.5 : 1.22),
            camera.aspect,
            V_FOV,
          ) * (wide ? 1.12 : 1.04);

        // Aim off-centre so the caption has a corner to itself — sideways on a
        // wide viewport where the panel is docked bottom-left, upward on a
        // narrow one where it sits underneath. Scaled by `openness` so it eases
        // in with the rest of the motion.
        const biasX = wide ? -distance * 0.14 * openness : 0;
        const biasY = wide ? 0 : -distance * 0.07 * openness;

        // Wide: centre the spread, which drifts left as the cover swings out.
        // Narrow: follow the recto instead, since that is the page in frame.
        focus.set(openness * size.width * (wide ? -0.42 : 0.16), 0, 0);
        camera.position.set(focus.x + 0.1, focus.y + 0.35, distance);
        camera.lookAt(focus.x + biasX, focus.y + biasY, 0);

        renderer.render(scene, camera);
        if (!painted) {
          painted = true;
          setLive(true);
        }
      };
      frame();

      return () => {
        disposed = true;
        unsubscribe();
        observer.disconnect();
        book.dispose();
        contact.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      };
    };

    // Deferred so the library lands after the HTML rather than inside the
    // page's first bundle.
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
  }, [turns]);

  // Which project the reader is looking at, for the caption and the link.
  // Kept in React rather than written into the DOM by the loop, because it
  // changes about five times over the whole scroll rather than every frame.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !live) return;
    return subscribeScroll(() => {
      const p = progressThrough(section);
      const pageSpan = (PAGES_TO - OPEN_TO) / turns;
      const index = Math.floor((p - OPEN_TO) / pageSpan);
      setActive(p < OPEN_TO ? -1 : Math.min(turns - 1, Math.max(0, index)));
    });
  }, [live, turns]);

  const project = active >= 0 ? writtenVolumes[active] : null;

  return (
    <section
      ref={sectionRef}
      // Tall enough that every page gets a comfortable screen of scroll. Under
      // reduced motion this collapses: the inline style is only applied when
      // the scene is live, so the fallback is an ordinary-height hero.
      style={live ? { height: `${(turns + 2) * 100}vh` } : undefined}
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
              Four projects, each one a working site rather than a screenshot.
            </h2>
            <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {writtenVolumes.map((volume) => (
                <li key={volume.title}>
                  <Link
                    href={volume.href ?? "/projects"}
                    className="group flex items-baseline gap-3 py-1"
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: volume.cloth }}
                      aria-hidden
                    />
                    <span className="font-serif text-lg group-hover:underline">
                      {volume.title}
                    </span>
                    <span className="text-muted text-xs">{volume.subtitle}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/*
          Caption over the live scene. Absolutely placed rather than laid out
          in the flex column: the sticky parent centres its children, so a
          flow-positioned caption lands in the middle of the screen on top of
          the book instead of underneath it.
        */}
        {live && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto w-full max-w-[88rem] px-5 pb-10 sm:px-8">
            <p className="sr-only" role="status" aria-live="polite">
              {project ? `${project.title}. ${project.subtitle}.` : "Selected work."}
            </p>

            {project ? (
              <div className="pointer-events-auto max-w-sm rounded-xl bg-black/75 p-4 text-white backdrop-blur-sm">
                <p
                  className="text-[11px] font-medium tracking-[0.14em] uppercase"
                  style={{ color: project.foil ?? "#cfcabb" }}
                >
                  {String(active + 1).padStart(2, "0")} / {String(turns).padStart(2, "0")} ·{" "}
                  {project.year}
                </p>
                <h2 className="mt-1 font-serif text-xl leading-tight">{project.title}</h2>
                <p className="mt-0.5 text-xs text-white/60">{project.subtitle}</p>
                <Link
                  href={project.href ?? "/projects"}
                  className="mt-3 inline-flex rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-black transition hover:bg-white/90"
                >
                  Read the case study
                </Link>
              </div>
            ) : (
              <div className="pointer-events-auto max-w-sm rounded-xl bg-black/70 p-4 text-white backdrop-blur-sm">
                <p className="text-[11px] font-medium tracking-[0.18em] text-white/50 uppercase">
                  Selected work
                </p>
                {/* Kept to two lines at every width — at 3xl this ran three
                    lines deep and pushed the scroll cue off the bottom of the
                    viewport, which is the one line that has to be readable. */}
                <h2 className="mt-1.5 font-serif text-lg leading-snug sm:text-xl">
                  Four projects, each a working site rather than a screenshot.
                </h2>
                <p className="mt-2 text-xs text-white/55">Scroll to turn the pages.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
