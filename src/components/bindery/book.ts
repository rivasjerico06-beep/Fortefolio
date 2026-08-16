/**
 * Hardcover construction.
 *
 * A volume is not a textured box. It is two boards, a spine, the hinge gaps
 * between them, a text block that sits inboard of the boards on all three
 * exposed sides, endpapers pasted to the inside of each board, headbands at
 * the head and tail of the spine, a bookmark, and a contact shadow. Getting
 * the square (the few millimetres the boards overhang the paper) right is most
 * of what makes the silhouette read as a book rather than a brick.
 *
 * Turnable sheets are hinged groups holding two planes back to back — recto on
 * the front, verso mounted `BackSide` with its texture mirrored so the reverse
 * of a page is not a mirror image of its own front. Both planes share an
 * identical vertex layout, so one displacement array bends the pair together.
 */
import * as THREE from "three";

import { makeSpreadTexture, makeTitlePageTexture, type BookMaps } from "./textures";
import { isUnwritten, type Volume } from "./volumes";

/** Board thickness in scene units. */
const BOARD = 0.022;
/** How far the boards overhang the text block — the "square". */
const SQUARE = 0.035;
/** Gap between spine and boards that lets a cover swing. */
const HINGE = 0.05;
/** Horizontal segments on a turnable sheet. Enough to curve smoothly. */
const SEGMENTS = 18;

export type Sheet = {
  /** Hinged at the spine; `rotation.y` runs 0 → -π as the page turns. */
  pivot: THREE.Group;
  recto: THREE.Mesh;
  verso: THREE.Mesh;
  /** Untouched copy of the flat vertex positions, used as the bend basis. */
  rest: Float32Array;
  width: number;
  /** How far the hinge travels forward over a full turn. See `bendSheet`. */
  travelZ: number;
};

export type Book = {
  group: THREE.Group;
  /** Front board and everything pasted to it. */
  coverPivot: THREE.Group;
  /** Meshes a raycaster may hit to mean "the cover". */
  coverTargets: THREE.Object3D[];
  sheets: Sheet[];
  shadow: THREE.Mesh;
  volume: Volume;
  size: { width: number; height: number; depth: number };
  dispose: () => void;
};

/**
 * Distance at which a box of `width` × `height` just fits the frame.
 *
 * Shared by both scenes because both need it for the same reason: volumes
 * differ in size, a book roughly doubles its width when the cover swings open,
 * and the viewport aspect decides whether width or height is the binding
 * constraint. A hardcoded distance that suits a closed book on a wide monitor
 * puts the camera inside the front board of an open one on a phone.
 */
export function fitDistance(width: number, height: number, aspect: number, fovDegrees: number) {
  const v = (fovDegrees * Math.PI) / 180;
  const h = 2 * Math.atan(Math.tan(v / 2) * Math.max(0.3, aspect));
  return Math.max(height / 2 / Math.tan(v / 2), width / 2 / Math.tan(h / 2));
}

function mirrored(texture: THREE.Texture) {
  const clone = texture.clone();
  clone.wrapS = THREE.RepeatWrapping;
  clone.repeat.x = -1;
  clone.offset.x = 1;
  clone.needsUpdate = true;
  return clone;
}

/**
 * A plane whose local x runs 0 → width, so the mesh hangs off a hinge placed
 * at the group origin rather than pivoting around its own middle.
 */
function hingedPlane(width: number, height: number, segments: number) {
  const geometry = new THREE.PlaneGeometry(width, height, segments, 1);
  geometry.translate(width / 2, 0, 0);
  return geometry;
}

export function createBook(
  volume: Volume,
  maps: BookMaps,
  /**
   * Page faces, front to back, overriding the ones derived from the volume's
   * own spreads. The home page's compilation volume supplies project pages
   * this way rather than the generic spread layout.
   */
  faceOverride?: THREE.Texture[],
): Book {
  const { width, height, depth } = volume.size;
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(item: T) => {
    disposables.push(item);
    return item;
  };

  const group = new THREE.Group();
  group.name = `volume:${volume.title}`;

  // Cloth shared by every board and the spine. The stamp masks vary per face,
  // so each face gets its own material instance over the same bump map.
  const clothMaterial = (colorMap: THREE.Texture, stampMap: THREE.Texture | null) =>
    track(
      new THREE.MeshStandardMaterial({
        map: colorMap,
        bumpMap: maps.cloth,
        bumpScale: 0.012,
        roughness: 0.92,
        metalness: 0,
        ...(stampMap
          ? { metalnessMap: stampMap, roughnessMap: stampMap, metalness: 0.85 }
          : {}),
      }),
    );

  const plainCloth = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(volume.cloth),
      bumpMap: maps.cloth,
      bumpScale: 0.012,
      roughness: 0.94,
      metalness: 0,
    }),
  );

  const paperMaterial = track(
    new THREE.MeshStandardMaterial({
      map: maps.pageFace,
      roughness: 0.95,
      metalness: 0,
    }),
  );

  const edgeMaterial = track(
    new THREE.MeshStandardMaterial({
      map: maps.edges,
      roughness: 0.88,
      metalness: 0,
    }),
  );

  const endpaperMaterial = track(
    new THREE.MeshStandardMaterial({
      map: maps.endpaper,
      roughness: 0.93,
      metalness: 0,
    }),
  );

  // ---- Text block --------------------------------------------------------
  // Inboard of the boards on fore-edge, head and tail; flush at the spine.
  const blockWidth = width - SQUARE;
  const blockHeight = height - SQUARE * 2;
  // The block is shortened at the front by more than the boards alone need,
  // to leave a real slot between its front face and the inside of the front
  // board. The turnable preview sheets live in that slot. Size it off the
  // boards and it comes out around 6mm — the sheets then sit *inside* the
  // block and you open the cover onto a blank slab.
  const blockDepth = depth - BOARD * 2 - 0.03;
  const blockGeometry = track(new THREE.BoxGeometry(blockWidth, blockHeight, blockDepth));
  const block = new THREE.Mesh(blockGeometry, [
    edgeMaterial, // +x fore-edge
    paperMaterial, // -x spine side, hidden
    edgeMaterial, // +y head
    edgeMaterial, // -y tail
    paperMaterial, // +z
    paperMaterial, // -z
  ]);
  block.position.x = -width / 2 + blockWidth / 2 + HINGE * 0.35;
  block.castShadow = true;
  block.receiveShadow = true;
  group.add(block);

  // ---- Back board --------------------------------------------------------
  const boardGeometry = track(new THREE.BoxGeometry(width, height, BOARD));
  const backBoard = new THREE.Mesh(boardGeometry, [
    plainCloth,
    plainCloth,
    plainCloth,
    plainCloth,
    endpaperMaterial, // inside face
    clothMaterial(maps.back, maps.backStamp), // outside face
  ]);
  backBoard.position.z = -depth / 2 + BOARD / 2;
  backBoard.castShadow = true;
  backBoard.receiveShadow = true;
  group.add(backBoard);

  // ---- Spine -------------------------------------------------------------
  const spineGeometry = track(new THREE.BoxGeometry(BOARD, height, depth));
  const spine = new THREE.Mesh(spineGeometry, [
    plainCloth, // +x, faces the text block
    clothMaterial(maps.spine, maps.spineStamp), // -x, the visible spine
    plainCloth,
    plainCloth,
    plainCloth,
    plainCloth,
  ]);
  spine.position.x = -width / 2 - BOARD / 2;
  spine.castShadow = true;
  spine.receiveShadow = true;
  group.add(spine);

  // ---- Headbands ---------------------------------------------------------
  const headbandGeometry = track(new THREE.BoxGeometry(0.03, 0.03, blockDepth * 0.92));
  const headbandMaterial = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(volume.foil ?? "#d8d2c4"),
      roughness: 0.7,
      metalness: 0.05,
    }),
  );
  for (const sign of [1, -1]) {
    const band = new THREE.Mesh(headbandGeometry, headbandMaterial);
    band.position.set(-width / 2 + 0.02, (sign * blockHeight) / 2, 0);
    band.castShadow = true;
    group.add(band);
  }

  // ---- Bookmark ----------------------------------------------------------
  // Only bound volumes carry one. An unwritten book has nothing to mark.
  if (!isUnwritten(volume)) {
    const ribbonGeometry = track(new THREE.PlaneGeometry(0.05, height * 0.62));
    const ribbonMaterial = track(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(volume.foil ?? "#c9c2b2"),
        roughness: 0.6,
        metalness: 0.1,
        side: THREE.DoubleSide,
      }),
    );
    const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
    ribbon.position.set(width * 0.22, -height * 0.24, blockDepth * 0.2);
    ribbon.rotation.z = 0.02;
    ribbon.castShadow = true;
    group.add(ribbon);
  }

  // ---- Turnable sheets ---------------------------------------------------
  // Title page first, then one sheet per spread. Unwritten volumes get a
  // single sheet carrying the "this volume is unwritten" notice.
  const sheetWidth = blockWidth - 0.015;
  const sheetHeight = blockHeight - 0.02;
  const faces: THREE.Texture[] = faceOverride
    ? faceOverride.map((texture) => track(texture))
    : [track(makeTitlePageTexture(volume))];
  if (!faceOverride) {
    for (let index = 0; index < volume.spreads.length; index += 1) {
      faces.push(track(makeSpreadTexture(volume, index)));
    }
  }

  const sheets: Sheet[] = [];
  // One sheet per printed face. Turning sheet k brings sheet k+1's recto up,
  // so a book with five faces needs four turns to reach the last of them.
  const sheetCount = Math.max(1, faces.length);
  /** Front face of the text block, and the inside face of the front board. */
  const blockFront = blockDepth / 2;
  const boardInner = depth / 2 - BOARD;
  for (let index = 0; index < sheetCount; index += 1) {
    const pivot = new THREE.Group();
    pivot.position.set(-width / 2 + HINGE * 0.35, 0, 0);

    const rectoGeometry = track(hingedPlane(sheetWidth, sheetHeight, SEGMENTS));
    const versoGeometry = track(hingedPlane(sheetWidth, sheetHeight, SEGMENTS));

    const rectoMaterial = track(
      new THREE.MeshStandardMaterial({
        map: faces[index],
        roughness: 0.95,
        metalness: 0,
      }),
    );
    // The back of a sheet carries the same page as its front, so the page you
    // were reading travels right-to-left as you turn it and the left half of
    // an open book is never blank.
    //
    // The tempting version — verso gets the *next* face — is wrong, and was
    // the first thing this did: turning sheet N then shows page N+1 on its
    // back while sheet N+1 shows page N+1 on its front, so the same page is
    // printed on both halves at once. Plain stock on the back is also wrong in
    // the other direction: correct, but it leaves a blank slab filling half
    // the frame for the whole read.
    const versoMaterial = track(
      new THREE.MeshStandardMaterial({
        map: track(mirrored(faces[index])),
        roughness: 0.95,
        metalness: 0,
        side: THREE.BackSide,
      }),
    );

    const recto = new THREE.Mesh(rectoGeometry, rectoMaterial);
    const verso = new THREE.Mesh(versoGeometry, versoMaterial);
    // Stacked into the slot between the block's front face and the inside of
    // the front board, sheet 0 frontmost so the title page is what you meet
    // when the cover lifts. The step is derived from the slot rather than
    // fixed, so a thin volume cannot push its pages through its own board.
    const slot = boardInner - blockFront;
    const step = Math.min(0.0024, (slot * 0.7) / (sheetCount + 1));
    const lift = blockFront + step * (sheetCount - index);
    recto.position.z = lift + 0.0006;
    verso.position.z = lift - 0.0006;
    recto.castShadow = false;
    verso.castShadow = false;

    pivot.add(recto, verso);
    group.add(pivot);

    sheets.push({
      pivot,
      recto,
      verso,
      rest: Float32Array.from(
        (rectoGeometry.getAttribute("position") as THREE.BufferAttribute).array as Float32Array,
      ),
      width: sheetWidth,
      // Where this sheet's hinge ends up once turned. It has to clear the open
      // board, and it has to grow with `index`: the stack inverts through the
      // flip, so the sheet turned *last* belongs on top of the left-hand pile,
      // while `lift` (its resting height in the shut book) runs the other way.
      // Driving the travel off `lift` alone puts the first page turned in front
      // of every page turned after it, and earlier pages bleed through.
      travelZ: depth / 2 - BOARD / 2 + 0.03 + index * 0.004 + lift,
    });
  }

  // ---- Front board -------------------------------------------------------
  const coverPivot = new THREE.Group();
  coverPivot.position.set(-width / 2, 0, depth / 2 - BOARD / 2);

  const frontBoard = new THREE.Mesh(boardGeometry, [
    plainCloth,
    plainCloth,
    plainCloth,
    plainCloth,
    clothMaterial(maps.front, maps.frontStamp), // outside face
    endpaperMaterial, // inside face, pasted down
  ]);
  frontBoard.position.x = width / 2;
  frontBoard.castShadow = true;
  frontBoard.receiveShadow = true;
  coverPivot.add(frontBoard);
  group.add(coverPivot);

  // ---- Contact shadow ----------------------------------------------------
  const shadowGeometry = track(new THREE.PlaneGeometry(width * 2.1, depth * 3.4));
  const shadowMaterial = track(
    new THREE.MeshBasicMaterial({
      map: null,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    }),
  );
  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -height / 2 + 0.004;
  shadow.renderOrder = -1;
  group.add(shadow);

  return {
    group,
    coverPivot,
    coverTargets: [frontBoard],
    sheets,
    shadow,
    volume,
    size: { width, height, depth },
    dispose: () => {
      disposables.forEach((item) => item.dispose());
      maps.dispose();
    },
  };
}

/**
 * Where a fully turned sheet comes to rest, in radians: level with the cover,
 * with a hair of fan so successive pages do not land in the same plane.
 *
 * Angle alone cannot get a turned page in front of the open board — see
 * `bendSheet`, which handles the depth half of the problem.
 */
export function sheetRestAngle(coverAngle: number, index: number) {
  return coverAngle + index * 0.008;
}

/**
 * Poses one sheet.
 *
 * `turn` is the fraction of the page's travel, 0 (flat against the block) to 1
 * (come to rest on the open cover). `restAngle` is where that rest position
 * is, from `sheetRestAngle`.
 *
 * Those are deliberately two arguments. An earlier version passed only
 * `angle / π` and derived everything from it, which quietly breaks: a page at
 * rest is turned to the cover's angle, about 0.92π, so "fully turned" arrives
 * at 0.92 rather than 1. Every quantity scaled by it — the forward travel
 * below, the curvature — then lands about eight per cent short, which is
 * exactly enough to leave a rested page coplanar with the board instead of on
 * top of it.
 *
 * The sheet also travels forward, not just rotates. The front board hinges
 * outside the text block, so its arc always ends in front of the page's at any
 * shared angle. Rotation alone cannot close that: turn the page further and it
 * sinks behind the board, turn it less and it stands off as a foreshortened
 * strip — both were tried. Sliding the hinge forward over the turn does close
 * it, and it is what paper does: a page lifts off the block and comes to rest
 * on top of the open cover rather than level with where it started.
 */
export function bendSheet(sheet: Sheet, turn: number, restAngle: number) {
  const t = Math.min(1, Math.max(0, turn));
  sheet.pivot.rotation.y = -t * restAngle;
  sheet.pivot.position.z = t * sheet.travelZ;

  const swell = Math.sin(t * Math.PI);
  const bulge = 0.11 * swell;
  const twist = 0.05 * swell;

  for (const mesh of [sheet.recto, sheet.verso]) {
    const attribute = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
    const array = attribute.array as Float32Array;
    for (let i = 0; i < array.length; i += 3) {
      const x = sheet.rest[i];
      const y = sheet.rest[i + 1];
      const u = x / sheet.width; // 0 at the hinge, 1 at the fore-edge
      array[i] = x;
      array[i + 1] = y;
      array[i + 2] =
        sheet.rest[i + 2] + Math.sin(u * Math.PI) * bulge + u * u * twist * (y > 0 ? 1 : -1);
    }
    attribute.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  }
}
