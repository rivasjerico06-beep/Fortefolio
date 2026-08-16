"use client";

/**
 * The shelf.
 *
 * State machine: shelf → opening → detail → closing → shelf, with reading
 * (cover open, pages turnable) as a sub-state of detail.
 *
 * Two things are worth knowing before editing this file.
 *
 * First, nothing is ever reparented. The brief this was built from warns about
 * the last-frame jump you get when a selected volume moves between the shelf
 * and an inspection scene graph; the cheapest way not to have that bug is not
 * to have that move. Every book stays in `shelfGroup` for its whole life and
 * the camera travels instead.
 *
 * Second, there are two kinds of motion here and they are not interchangeable.
 * Discrete transitions (shelf ↔ detail) are explicit timed tweens that write
 * their exact endpoint on the final frame. Continuous follows (hover, cover
 * angle, page settle) are exponential smoothing on `1 - exp(-k·dt)`, which is
 * frame-rate independent, plus an epsilon snap so they actually arrive. A
 * plain `lerp(a, b, 0.1)` per frame is neither, and it is what makes 3D scenes
 * feel different on a 144Hz monitor.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from "lucide-react";
import Link from "next/link";

import { bendSheet, createBook, fitDistance, type Book } from "@/components/bindery/book";
import {
  makeBookMaps,
  makeContactShadowTexture,
  makeWoodTexture,
} from "@/components/bindery/textures";
import { isUnwritten, volumes } from "@/components/bindery/volumes";

type Mode = "shelf" | "opening" | "detail" | "closing";

/** Seconds a shelf ↔ detail transition takes. Zero under reduced motion. */
const TRANSITION = 0.9;
/** Gap between volumes on the shelf, in scene units. */
const GAP = 0.055;
/** Vertical field of view. Framing maths below depends on it. */
const V_FOV = 38;

/** Framing distance for the whole shelf, and for one volume held up close. */
function shelfDistance(aspect: number) {
  // Frames the selected volume and its immediate neighbours rather than the
  // whole run. Fitting all seven leaves the books small and the top third of
  // the frame empty, and a shelf you cannot see the ends of reads as longer.
  return fitDistance(2.5, 2.4, aspect, V_FOV) * 1.1;
}
function detailDistance(size: { width: number; height: number }, aspect: number) {
  return fitDistance(size.width * 1.45, size.height * 1.28, aspect, V_FOV) * 1.06;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Frame-rate independent approach. Returns the new current value. */
function approach(current: number, target: number, rate: number, dt: number) {
  const next = current + (target - current) * (1 - Math.exp(-rate * dt));
  return Math.abs(target - next) < 0.0001 ? target : next;
}

function supportsWebGL() {
  try {
    const probe = document.createElement("canvas");
    return Boolean(
      probe.getContext("webgl2") ??
      probe.getContext("webgl") ??
      probe.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

/** Everything mutable the render loop touches. Kept out of React state. */
type World = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  shelfGroup: THREE.Group;
  books: Book[];
  slots: number[];
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
  /** Orbit state, spherical around the inspected volume. */
  orbit: { theta: number; phi: number; radius: number; panX: number; panY: number };
  /** Where the shelf has slid to, and where it is going. */
  shelfX: { current: number; target: number };
  coverAngle: { current: number; target: number };
  /** Per-sheet turn progress, 0 → 1. */
  pageProgress: number[];
  pageTarget: number[];
  /** Sheet currently under a drag, or -1. */
  draggingSheet: number;
  transition: {
    active: boolean;
    /**
     * Wall-clock start, from `performance.now()` — not an accumulator fed by
     * per-frame deltas. Those deltas are clamped so a backgrounded tab cannot
     * resume with one enormous step, and accumulating a clamped delta means
     * that on any machine slower than the clamp, time itself runs slow: a
     * 0.9s transition took several seconds under software rendering before
     * this was wall-clock driven.
     */
    startedAt: number;
    duration: number;
    fromTheta: number;
    toTheta: number;
    fromRadius: number;
    toRadius: number;
    fromLift: number;
    toLift: number;
    fromTurn: number;
    toTurn: number;
    onDone: (() => void) | null;
  };
  /** How far the selected volume has pulled out of the shelf and turned. */
  lift: number;
  turn: number;
  hovered: number;
  /** Set by anything outside the loop that changes the picture. */
  dirty: boolean;
  background: THREE.Color;
  backgroundTarget: THREE.Color;
  reducedMotion: boolean;
  disposers: (() => void)[];
};

export function Shelf() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<World | null>(null);

  const fallbackRef = useRef<HTMLParagraphElement | null>(null);

  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("shelf");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");

  // State the render loop and the DOM listeners read without re-subscribing.
  // Mirrored in an effect rather than during render — writing a ref while
  // rendering is a tear under concurrent React, and one frame of staleness in
  // an animation loop is invisible.
  const modeRef = useRef(mode);
  const indexRef = useRef(index);
  const openRef = useRef(open);
  useEffect(() => {
    modeRef.current = mode;
    indexRef.current = index;
    openRef.current = open;
  }, [mode, index, open]);

  const volume = volumes[index];
  const sheetCount = Math.max(1, volume.spreads.length || 1);

  /** Runs a timed tween between two shelf/detail poses. */
  const runTransition = useCallback(
    (to: "detail" | "shelf", which: number, onDone: () => void) => {
      const world = worldRef.current;
      if (!world) return onDone();
      const t = world.transition;
      const detail = to === "detail";
      t.fromTheta = world.orbit.theta;
      t.toTheta = detail ? -0.42 : 0;
      const aspect = world.camera.aspect;
      t.fromRadius = world.orbit.radius;
      t.toRadius = detail
        ? detailDistance(world.books[which].size, aspect)
        : shelfDistance(aspect);
      t.fromLift = world.lift;
      t.toLift = detail ? 1 : 0;
      t.fromTurn = world.turn;
      t.toTurn = detail ? 1 : 0;
      t.startedAt = performance.now();
      t.duration = world.reducedMotion ? 0 : TRANSITION;
      t.active = true;
      t.onDone = onDone;
      world.orbit.phi = detail ? 0.06 : 0;
      world.orbit.panX = 0;
      world.orbit.panY = 0;
    },
    [],
  );

  const goToDetail = useCallback(
    (next: number) => {
      setIndex(next);
      setMode("opening");
      setStatus(
        `${volumes[next].title}. ${isUnwritten(volumes[next]) ? "Unwritten volume." : "Opened for inspection."}`,
      );
      runTransition("detail", next, () => setMode("detail"));
    },
    [runTransition],
  );

  const backToShelf = useCallback(() => {
    const world = worldRef.current;
    if (world) {
      world.coverAngle.target = 0;
      world.pageTarget = world.pageTarget.map(() => 0);
    }
    setOpen(false);
    setPage(0);
    setMode("closing");
    setStatus("Back at the shelf.");
    runTransition("shelf", indexRef.current, () => setMode("shelf"));
  }, [runTransition]);

  const navigate = useCallback((delta: number) => {
    setIndex((current) => {
      const next = Math.min(volumes.length - 1, Math.max(0, current + delta));
      if (next !== current) {
        setStatus(
          `Volume ${next + 1} of ${volumes.length}. ${volumes[next].spine || "Unwritten"}.`,
        );
      }
      return next;
    });
  }, []);

  // ---- Scene construction, once -----------------------------------------
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // The unsupported notice is in the markup already and visible by default,
    // so there is no state to set here — if WebGL is missing we leave without
    // appending a canvas and the notice is simply what stays on screen.
    if (!supportsWebGL()) return;

    let cancelled = false;
    let teardown: (() => void) | null = null;

    // Three.js is fetched here rather than imported at the top of the file so
    // that it reaches the browser the same way it does on the home page. A
    // module pulled in statically by one route and dynamically by another is
    // emitted twice, and this page was shipping ~57KB of duplicate library.
    const start = (three: typeof import("three")) => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const renderer = new three.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.shadowMap.enabled = true;
      // PCFSoft was deprecated in r185; PCF is what it falls back to anyway.
      renderer.shadowMap.type = three.PCFShadowMap;
      renderer.toneMapping = three.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.display = "block";
      renderer.domElement.style.touchAction = "none";
      if (fallbackRef.current) fallbackRef.current.hidden = true;

      const scene = new three.Scene();
      const background = new three.Color("#1a1512");
      scene.background = background;
      scene.fog = new three.Fog(background.clone(), 9, 22);

      const camera = new three.PerspectiveCamera(
        38,
        mount.clientWidth / Math.max(1, mount.clientHeight),
        0.1,
        100,
      );

      // ---- Lighting --------------------------------------------------------
      scene.add(new three.AmbientLight(0xffffff, 0.55));

      const key = new three.DirectionalLight(0xfff1de, 2.1);
      key.position.set(3.4, 5.2, 5.6);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 1;
      key.shadow.camera.far = 24;
      key.shadow.camera.left = -8;
      key.shadow.camera.right = 8;
      key.shadow.camera.top = 6;
      key.shadow.camera.bottom = -6;
      key.shadow.bias = -0.0012;
      scene.add(key);

      const fill = new three.DirectionalLight(0xd8e4ff, 0.5);
      fill.position.set(-5, 2.4, 3.2);
      scene.add(fill);

      const rim = new three.DirectionalLight(0xffd9a8, 0.7);
      rim.position.set(-1.6, 3.2, -5.4);
      scene.add(rim);

      // ---- Shelf timber ----------------------------------------------------
      const woodTexture = makeWoodTexture();
      woodTexture.repeat.set(4, 1);
      const woodMaterial = new three.MeshStandardMaterial({
        map: woodTexture,
        roughness: 0.78,
        metalness: 0,
      });
      const boardGeometry = new three.BoxGeometry(24, 0.34, 2.4);
      const board = new three.Mesh(boardGeometry, woodMaterial);
      board.position.y = -1.19;
      board.receiveShadow = true;
      scene.add(board);

      const backPanelMaterial = new three.MeshStandardMaterial({
        color: 0x171310,
        roughness: 1,
        metalness: 0,
      });
      const backPanel = new three.Mesh(new three.PlaneGeometry(40, 16), backPanelMaterial);
      backPanel.position.set(0, 2, -1.5);
      backPanel.receiveShadow = true;
      scene.add(backPanel);

      // ---- Volumes ---------------------------------------------------------
      const shelfGroup = new three.Group();
      scene.add(shelfGroup);

      const contactShadow = makeContactShadowTexture();
      const books: Book[] = [];
      const slots: number[] = [];
      let cursor = 0;

      for (const item of volumes) {
        const book = createBook(item, makeBookMaps(item));
        // Spine out: the book's local -x face turns to meet the camera.
        book.group.rotation.y = Math.PI / 2;
        book.group.position.y = item.size.height / 2 - 1.02;
        (book.shadow.material as THREE.MeshBasicMaterial).map = contactShadow;
        (book.shadow.material as THREE.MeshBasicMaterial).needsUpdate = true;

        const half = item.size.depth / 2;
        cursor += half;
        slots.push(cursor);
        book.group.position.x = cursor;
        cursor += half + GAP;

        shelfGroup.add(book.group);
        books.push(book);
      }

      // Centre the run of books on the origin.
      const span = cursor - GAP;
      for (let i = 0; i < slots.length; i += 1) {
        slots[i] -= span / 2;
        books[i].group.position.x = slots[i];
      }

      const world: World = {
        renderer,
        scene,
        camera,
        shelfGroup,
        books,
        slots,
        raycaster: new three.Raycaster(),
        pointer: new three.Vector2(-2, -2),
        orbit: {
          theta: 0,
          phi: 0,
          radius: shelfDistance(camera.aspect),
          panX: 0,
          panY: 0,
        },
        shelfX: { current: -slots[0], target: -slots[0] },
        coverAngle: { current: 0, target: 0 },
        pageProgress: [],
        pageTarget: [],
        draggingSheet: -1,
        transition: {
          active: false,
          startedAt: 0,
          duration: TRANSITION,
          fromTheta: 0,
          toTheta: 0,
          fromRadius: 0,
          toRadius: 0,
          fromLift: 0,
          toLift: 0,
          fromTurn: 0,
          toTurn: 0,
          onDone: null,
        },
        lift: 0,
        turn: 0,
        hovered: -1,
        dirty: true,
        background,
        backgroundTarget: background.clone(),
        reducedMotion,
        disposers: [
          () => woodTexture.dispose(),
          () => contactShadow.dispose(),
          () => woodMaterial.dispose(),
          () => boardGeometry.dispose(),
          () => backPanelMaterial.dispose(),
          () => backPanel.geometry.dispose(),
          ...books.map((book) => () => book.dispose()),
        ],
      };
      worldRef.current = world;

      // ---- Resize ----------------------------------------------------------
      const resize = () => {
        const width = mount.clientWidth;
        const height = Math.max(1, mount.clientHeight);
        renderer.setSize(width, height);
        // Re-derive the framing distance: the aspect just changed, so what used
        // to fit may not any more. Skipped mid-transition, which owns the value.
        if (!world.transition.active) {
          world.orbit.radius =
            modeRef.current === "shelf"
              ? shelfDistance(width / height)
              : detailDistance(world.books[indexRef.current].size, width / height);
        }
        world.dirty = true;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(mount);

      // ---- Render loop -----------------------------------------------------
      let frame = 0;
      let painted = false;
      let last = performance.now();
      // Reused rather than reallocated — this runs up to 60 times a second.
      const focus = new three.Vector3();

      const tick = () => {
        frame = requestAnimationFrame(tick);
        const now = performance.now();
        // Only the continuous smoothing below uses this; the timed transition
        // reads the wall clock directly so its duration is honest at any frame
        // rate. (THREE.Clock is deprecated in favour of THREE.Timer as of r185,
        // and neither is needed for two lines of subtraction.)
        //
        // The clamp is deliberately loose. `1 - exp(-k·dt)` saturates at 1, so a
        // huge dt cannot overshoot — it just snaps, which is the right answer
        // after a tab has been backgrounded. A tight clamp does real harm in the
        // other direction: at 2fps it feeds 50ms of simulated time per 400ms
        // frame, so every eased motion runs in quarter speed on exactly the
        // hardware that can least afford to wait for it.
        const dt = Math.min((now - last) / 1000, 0.25);
        last = now;
        const active = indexRef.current;
        const inDetail = modeRef.current === "detail" || modeRef.current === "opening";

        // Anything that moved this frame flips this. If nothing did, the frame
        // is not drawn at all — a static shelf costs no GPU time and no power,
        // which on this site of all sites is the point.
        let changed = world.dirty || !painted;
        world.dirty = false;

        // Discrete transition, exact endpoints on the final frame.
        const t = world.transition;
        if (t.active) {
          changed = true;
          const raw =
            t.duration <= 0 ? 1 : Math.min(1, (now - t.startedAt) / (t.duration * 1000));
          const e = easeInOut(raw);
          world.orbit.theta = t.fromTheta + (t.toTheta - t.fromTheta) * e;
          world.orbit.radius = t.fromRadius + (t.toRadius - t.fromRadius) * e;
          world.lift = t.fromLift + (t.toLift - t.fromLift) * e;
          world.turn = t.fromTurn + (t.toTurn - t.fromTurn) * e;
          if (raw >= 1) {
            world.orbit.theta = t.toTheta;
            world.orbit.radius = t.toRadius;
            world.lift = t.toLift;
            world.turn = t.toTurn;
            t.active = false;
            const done = t.onDone;
            t.onDone = null;
            done?.();
          }
        }

        // Shelf slide.
        world.shelfX.target = -world.slots[active];
        const shelfBefore = world.shelfX.current;
        world.shelfX.current = world.reducedMotion
          ? world.shelfX.target
          : approach(world.shelfX.current, world.shelfX.target, 7, dt);
        if (world.shelfX.current !== shelfBefore) changed = true;
        shelfGroup.position.x = world.shelfX.current;

        // Per-book pose.
        for (let i = 0; i < world.books.length; i += 1) {
          const book = world.books[i];
          const selected = i === active;
          const hovered = world.hovered === i && !inDetail;

          const nudge = selected ? world.lift : 0;
          const hoverNudge = hovered ? 0.09 : 0;
          const targetZ = nudge * 0.55 + hoverNudge;
          const targetRotation =
            Math.PI / 2 - (selected ? world.turn : 0) * (Math.PI / 2 + 0.42);
          const targetY = book.size.height / 2 - 1.02 + (selected ? world.lift * 0.34 : 0);

          const zBefore = book.group.position.z;
          const yBefore = book.group.position.y;
          book.group.position.z = world.reducedMotion
            ? targetZ
            : approach(zBefore, targetZ, 9, dt);
          book.group.position.y = world.reducedMotion
            ? targetY
            : approach(yBefore, targetY, 9, dt);
          if (book.group.position.z !== zBefore || book.group.position.y !== yBefore) {
            changed = true;
          }
          book.group.rotation.y = targetRotation;

          // Unselected volumes dim away in detail so the panel keeps contrast.
          const dim = inDetail && !selected ? 0.12 : 1;
          book.group.visible = dim > 0.2 || !inDetail;
          (book.shadow.material as THREE.MeshBasicMaterial).opacity =
            0.5 * (selected ? 1 : inDetail ? 0.15 : 1);
        }

        // Cover and pages, only meaningful on the selected volume.
        const book = world.books[active];
        const coverBefore = world.coverAngle.current;
        world.coverAngle.current = world.reducedMotion
          ? world.coverAngle.target
          : approach(coverBefore, world.coverAngle.target, 8, dt);
        const coverMoved = world.coverAngle.current !== coverBefore;
        if (coverMoved) changed = true;
        book.coverPivot.rotation.y = -world.coverAngle.current;

        for (let s = 0; s < book.sheets.length; s += 1) {
          const target = world.pageTarget[s] ?? 0;
          const current = world.pageProgress[s] ?? 0;
          const next =
            world.draggingSheet === s
              ? current
              : world.reducedMotion
                ? target
                : approach(current, target, 9, dt);
          // Re-bend when the sheet moved, when it is under a drag, or when the
          // cover angle moved — the bend is scaled by how far the book is open,
          // so a still page over a moving cover still has to be redrawn.
          if (next !== current || coverMoved || world.draggingSheet === s) {
            world.pageProgress[s] = next;
            bendSheet(book.sheets[s], next * (world.coverAngle.current / Math.PI));
            changed = true;
          }
          book.sheets[s].pivot.visible = world.coverAngle.current > 0.05;
        }

        // Background eases to a tint of the selected cloth, then stops.
        if (
          Math.abs(world.background.r - world.backgroundTarget.r) +
            Math.abs(world.background.g - world.backgroundTarget.g) +
            Math.abs(world.background.b - world.backgroundTarget.b) >
          0.002
        ) {
          world.background.lerp(world.backgroundTarget, 1 - Math.exp(-3 * dt));
          (scene.fog as THREE.Fog).color.copy(world.background);
          changed = true;
        } else if (!world.background.equals(world.backgroundTarget)) {
          world.background.copy(world.backgroundTarget);
          (scene.fog as THREE.Fog).color.copy(world.background);
          changed = true;
        }

        // Camera: spherical around the selected volume, with a pan offset that
        // pushes the book left of centre so the panel has room on wide screens.
        // How far the cover has swung, 0 → ~0.92 of a half-turn.
        const openness = world.coverAngle.current / Math.PI;

        focus.set(
          world.slots[active] + world.shelfX.current,
          book.size.height / 2 - 1.02 + world.lift * 0.34,
          0,
        );
        // An opening cover swings out past the spine to the left, so the centre
        // of what you are looking at drifts that way and the whole spread needs
        // more room than the closed board did.
        focus.x -= openness * book.size.width * 0.5 * world.lift;

        const { theta, phi, panX, panY } = world.orbit;
        const radius = world.orbit.radius + openness * book.size.width * 1.15;
        camera.position.set(
          focus.x + radius * Math.sin(theta) * Math.cos(phi) + panX,
          focus.y + radius * Math.sin(phi) + panY + 0.3,
          focus.z + radius * Math.cos(theta) * Math.cos(phi),
        );

        // Bias the aim so the volume clears the reading panel — sideways when
        // the panel is docked right on a wide viewport, downward when it is
        // stacked underneath on a narrow one. Scaled by `lift` so it eases in
        // with the rest of the transition rather than snapping at the end.
        const wide = mount.clientWidth >= 900;
        const biasX = wide ? radius * 0.22 * world.lift : 0;
        const biasY = wide ? 0 : -radius * 0.17 * world.lift;
        camera.lookAt(focus.x + panX + biasX, focus.y + panY + biasY, focus.z);

        if (!changed) return;
        renderer.render(scene, camera);

        // "Ready" means a frame is on screen, not that the constructor returned
        // — so the controls appear over a drawn shelf rather than over nothing.
        if (!painted) {
          painted = true;
          setReady(true);
        }
      };
      tick();

      return () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        world.disposers.forEach((dispose) => dispose());
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement);
        }
        worldRef.current = null;
      };
    };

    void import("three").then((three) => {
      if (cancelled) return;
      teardown = start(three);
    });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, []);

  // ---- Keep the world's page/cover targets in step with React ------------
  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;
    world.pageTarget = Array.from({ length: sheetCount }, (_, i) => (i < page ? 1 : 0));
    world.dirty = true;
    if (world.pageProgress.length !== sheetCount) {
      world.pageProgress = Array.from({ length: sheetCount }, () => 0);
    }
  }, [page, sheetCount, index]);

  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;
    world.coverAngle.target = open ? Math.PI * 0.92 : 0;
    world.dirty = true;
  }, [open]);

  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;
    // Mutated rather than constructed: `new THREE.Color` would be a runtime
    // reference to a library this file now only imports as types.
    world.backgroundTarget.set(volume.cloth).multiplyScalar(0.32).offsetHSL(0, -0.06, 0.02);
    world.dirty = true;
  }, [volume]);

  // ---- Pointer, wheel and keyboard --------------------------------------
  useEffect(() => {
    const mount = mountRef.current;
    const world = worldRef.current;
    if (!mount || !world) return;

    const canvas = world.renderer.domElement;
    let dragging: "none" | "orbit" | "page" = "none";
    let lastX = 0;
    let lastY = 0;
    let wheelLock = 0;

    const setPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      world.pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
    };

    const pick = () => {
      world.raycaster.setFromCamera(world.pointer, world.camera);
      const meshes = world.books.flatMap((book, i) =>
        book.group.visible ? [{ i, object: book.group }] : [],
      );
      for (const { i, object } of meshes) {
        const hits = world.raycaster.intersectObject(object, true);
        if (hits.length) return i;
      }
      return -1;
    };

    const onPointerMove = (event: PointerEvent) => {
      setPointer(event);

      if (dragging === "orbit") {
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        world.orbit.theta -= dx * 0.005;
        world.dirty = true;
        world.orbit.phi = Math.max(-0.5, Math.min(0.6, world.orbit.phi + dy * 0.004));
        lastX = event.clientX;
        lastY = event.clientY;
        return;
      }

      if (dragging === "page" && world.draggingSheet >= 0) {
        const dx = (event.clientX - lastX) / Math.max(200, canvas.clientWidth * 0.4);
        const start = world.pageProgress[world.draggingSheet] ?? 0;
        world.pageProgress[world.draggingSheet] = Math.min(1, Math.max(0, start - dx));
        world.dirty = true;
        lastX = event.clientX;
        return;
      }

      if (modeRef.current === "shelf") {
        const before = world.hovered;
        world.hovered = pick();
        if (world.hovered !== before) world.dirty = true;
        canvas.style.cursor = world.hovered >= 0 ? "pointer" : "default";
      } else if (modeRef.current === "detail") {
        // Hover the cover of a closed book to crack it open.
        const book = world.books[indexRef.current];
        const overCover = world.raycaster.intersectObjects(book.coverTargets, true).length > 0;
        canvas.style.cursor = overCover ? "pointer" : "grab";
        if (!openRef.current) {
          world.coverAngle.target = overCover ? 0.26 : 0;
          world.dirty = true;
        }
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      setPointer(event);
      canvas.setPointerCapture(event.pointerId);
      lastX = event.clientX;
      lastY = event.clientY;

      if (modeRef.current === "shelf") return;
      if (modeRef.current !== "detail") return;

      world.raycaster.setFromCamera(world.pointer, world.camera);
      const book = world.books[indexRef.current];

      if (openRef.current) {
        // Grab the topmost untur ned sheet, or the last turned one going back.
        const forward = book.sheets.findIndex((_, i) => (world.pageProgress[i] ?? 0) < 0.5);
        const sheetIndex = forward === -1 ? book.sheets.length - 1 : forward;
        const meshes = book.sheets.flatMap((sheet) => [sheet.recto, sheet.verso]);
        if (world.raycaster.intersectObjects(meshes, false).length) {
          dragging = "page";
          world.draggingSheet = sheetIndex;
          return;
        }
      }

      dragging = "orbit";
      canvas.style.cursor = "grabbing";
    };

    const onPointerUp = (event: PointerEvent) => {
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      const moved = Math.abs(event.clientX - lastX) > 4 || Math.abs(event.clientY - lastY) > 4;

      if (dragging === "page" && world.draggingSheet >= 0) {
        // Commit past halfway, otherwise spring back. Either way React owns
        // the page number afterwards so the two never disagree.
        const progress = world.pageProgress[world.draggingSheet] ?? 0;
        const sheet = world.draggingSheet;
        world.draggingSheet = -1;
        setPage(progress > 0.5 ? sheet + 1 : sheet);
        dragging = "none";
        return;
      }

      if (dragging === "orbit" && !moved && modeRef.current === "detail") {
        setPointer(event);
        world.raycaster.setFromCamera(world.pointer, world.camera);
        const book = world.books[indexRef.current];
        if (world.raycaster.intersectObjects(book.coverTargets, true).length) {
          setOpen((current) => !current);
        }
      }

      if (dragging === "none" && modeRef.current === "shelf") {
        const hit = pick();
        if (hit >= 0) goToDetail(hit);
      }

      dragging = "none";
      canvas.style.cursor = modeRef.current === "detail" ? "grab" : "default";
    };

    // A click on the shelf is a true single click, not a drag gesture.
    const onClick = (event: MouseEvent) => {
      if (modeRef.current !== "shelf") return;
      const rect = canvas.getBoundingClientRect();
      world.pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      const hit = pick();
      if (hit >= 0) goToDetail(hit);
    };

    const onWheel = (event: WheelEvent) => {
      if (modeRef.current === "detail") {
        event.preventDefault();
        world.dirty = true;
        // Zoom limits are relative to whatever currently frames this volume,
        // not absolute scene units — a tall book on a phone starts further
        // back than a short one on a monitor, and the floor has to follow.
        const fit = detailDistance(world.books[indexRef.current].size, world.camera.aspect);
        world.orbit.radius = Math.max(
          fit * 0.6,
          Math.min(fit * 2.2, world.orbit.radius + event.deltaY * 0.002),
        );
        return;
      }
      if (modeRef.current !== "shelf") return;
      event.preventDefault();
      const now = performance.now();
      if (now - wheelLock < 260) return;
      const delta = event.deltaY || event.deltaX;
      if (Math.abs(delta) < 4) return;
      wheelLock = now;
      navigate(delta > 0 ? 1 : -1);
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [ready, goToDetail, navigate]);

  // Keyboard is bound to the window so the whole scene is operable without
  // finding the canvas first. Ignored while a form control has focus.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      if (event.key === "Escape" && mode === "detail") {
        event.preventDefault();
        return backToShelf();
      }
      if (mode === "shelf") {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          navigate(1);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          navigate(-1);
        } else if (event.key === "Enter" || event.key === " ") {
          if (target?.tagName === "BUTTON" || target?.tagName === "A") return;
          event.preventDefault();
          goToDetail(indexRef.current);
        }
        return;
      }
      if (mode === "detail" && open) {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          setPage((p) => Math.min(sheetCount, p + 1));
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          setPage((p) => Math.max(0, p - 1));
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, open, sheetCount, navigate, backToShelf, goToDetail]);

  const unwritten = isUnwritten(volume);
  const inDetail = mode === "detail" || mode === "opening";

  return (
    <div className="relative isolate w-full overflow-hidden bg-[#1a1512]">
      {/*
        The canvas is appended here on mount. Until then — and permanently, if
        this browser has no WebGL — the notice below is what occupies the space.
        It is real markup rather than a state branch, so there is nothing to
        set and nothing to get wrong.
      */}
      <div
        ref={mountRef}
        className="grid h-[min(78vh,720px)] w-full place-items-center"
        aria-hidden="true"
      >
        <p
          ref={fallbackRef}
          className="max-w-md px-6 text-center text-sm leading-relaxed text-white/55"
        >
          This shelf is drawn with WebGL, which this browser has turned off or does not support.
          Every volume and everything printed inside it is listed below in plain HTML — nothing
          on this page is reachable only through the 3D scene.
        </p>
      </div>

      {/* Announcements for anyone not watching the canvas. */}
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      {/* ---- Shelf controls ---- */}
      {mode === "shelf" && ready && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6">
          {/*
            The caption carries its own ground rather than relying on whatever
            the scene happens to be showing behind it — pale cloth, lit timber,
            a foil stamp. White-on-anything is the contrast failure the other
            case studies here were rebuilt to remove. A full-width scrim would
            also work and was tried first; it buries the shelf the demo exists
            to show, so the panel is kept to the width of the text instead.
          */}
          <div className="pointer-events-auto mx-auto flex max-w-2xl flex-col items-center gap-4">
            <div className="rounded-2xl bg-black/70 px-5 py-2.5 text-center backdrop-blur-sm">
              <p className="font-serif text-lg text-white sm:text-xl">
                {unwritten ? "Unwritten" : volume.title}
              </p>
              <p className="mt-0.5 text-xs text-white/70">
                {volume.subtitle} · Volume {index + 1} of {volumes.length}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-black/60 px-2 py-1.5 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={index === 0}
                aria-label="Previous volume"
                className="rounded-full border border-white/15 bg-black/40 p-2 text-white/80 backdrop-blur transition hover:border-white/35 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>

              <div className="flex items-center gap-1.5 px-1">
                {volumes.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Go to volume ${i + 1}, ${item.spine || "unwritten"}`}
                    aria-current={i === index}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? "w-7 bg-white" : "w-1.5 bg-white/35 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => navigate(1)}
                disabled={index === volumes.length - 1}
                aria-label="Next volume"
                className="rounded-full border border-white/15 bg-black/40 p-2 text-white/80 backdrop-blur transition hover:border-white/35 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>

            <button
              type="button"
              onClick={() => goToDetail(index)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-black transition hover:bg-white/90"
            >
              <BookOpen className="size-3.5" aria-hidden />
              Inspect this volume
            </button>
          </div>
        </div>
      )}

      {/* ---- Detail panel ---- */}
      {inDetail && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-end p-4 sm:p-6">
          <div className="pointer-events-auto w-full max-w-sm rounded-xl border border-white/10 bg-black/80 p-5 text-white backdrop-blur-md sm:max-w-md">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="text-[11px] font-medium tracking-[0.14em] uppercase"
                  style={{ color: volume.foil ?? "#b9b3a6" }}
                >
                  Volume {index + 1} · {volume.year}
                </p>
                <h2 className="mt-1 font-serif text-xl leading-tight">
                  {unwritten ? "Unwritten" : volume.title}
                </h2>
                <p className="mt-0.5 text-xs text-white/55">{volume.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={backToShelf}
                aria-label="Return to the shelf"
                className="shrink-0 rounded-full border border-white/15 p-1.5 text-white/70 transition hover:border-white/40 hover:text-white"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <p className="mt-3 text-[13px] leading-relaxed text-white/75">{volume.blurb}</p>

            <dl className="mt-4 space-y-1 border-t border-white/10 pt-3 text-[11px]">
              <div className="flex justify-between gap-4">
                <dt className="text-white/45">Binding</dt>
                <dd className="text-right text-white/70">{volume.binding}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/45">Spreads</dt>
                <dd className="text-white/70">{volume.spreads.length || "—"}</dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-black transition hover:bg-white/90"
              >
                <BookOpen className="size-3.5" aria-hidden />
                {open ? "Close the book" : "Open the book"}
              </button>

              {open && volume.spreads.length > 0 && (
                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    aria-label="Previous page"
                    className="rounded-full border border-white/15 p-1.5 text-white/75 transition hover:border-white/40 disabled:opacity-30"
                  >
                    <ArrowLeft className="size-3.5" aria-hidden />
                  </button>
                  <span className="px-1 text-[11px] text-white/55 tabular-nums">
                    {page} / {sheetCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(sheetCount, p + 1))}
                    disabled={page >= sheetCount}
                    aria-label="Next page"
                    className="rounded-full border border-white/15 p-1.5 text-white/75 transition hover:border-white/40 disabled:opacity-30"
                  >
                    <ArrowRight className="size-3.5" aria-hidden />
                  </button>
                </div>
              )}

              {volume.href && (
                <Link
                  href={volume.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-[11px] text-white/80 transition hover:border-white/45 hover:text-white"
                >
                  {volume.slug ? "Case study" : "Visit the site"}
                </Link>
              )}

              <button
                type="button"
                onClick={backToShelf}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-[11px] text-white/80 transition hover:border-white/45 hover:text-white"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                Shelf
              </button>
            </div>

            <p className="mt-3 text-[10px] leading-relaxed text-white/35">
              Drag the background to orbit · scroll to zoom · drag a page to turn it · Esc
              returns to the shelf
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
