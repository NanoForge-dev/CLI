/**
 * @typedef {import("@nanoforge-dev/ecs").EditorComponentManifest} EditorComponentManifest
 * @typedef {import("@nanoforge-dev/graphics-2d").Layer} Layer
 * @typedef {import("nanoforge").NfFile} NfFile
 */

import { Circle } from "@nanoforge-dev/graphics-2d";

export class DrawableCircle2D {
  name = this.constructor.name;
  shape;

  /** @type {NfFile | undefined} */
  #fillPatternImage;

  /**
   * @param {number} [radius]
   * @param {boolean} [visible]
   * @param {string} [id]
   * @param {number} [opacity]
   * @param {number} [scaleX]
   * @param {number} [scaleY]
   * @param {number} [skewX]
   * @param {number} [skewY]
   * @param {number} [rotation]
   * @param {number} [offsetX]
   * @param {number} [offsetY]
   * @param {string} [fillColor]
   * @param {NfFile} [fillPatternImage]
   * @param {number} [fillPatternX]
   * @param {number} [fillPatternY]
   * @param {number} [fillPatternOffsetX]
   * @param {number} [fillPatternOffsetY]
   * @param {number} [fillPatternScaleX]
   * @param {number} [fillPatternScaleY]
   * @param {number} [fillPatternRotation]
   * @param {string} [fillPatternRepeat]
   */
  constructor(
    radius,
    visible,
    id,
    opacity,
    scaleX,
    scaleY,
    skewX,
    skewY,
    rotation,
    offsetX,
    offsetY,
    fillColor,
    fillPatternImage,
    fillPatternX,
    fillPatternY,
    fillPatternOffsetX,
    fillPatternOffsetY,
    fillPatternScaleX,
    fillPatternScaleY,
    fillPatternRotation,
    fillPatternRepeat,
  ) {
    this.#fillPatternImage = fillPatternImage;

    this.shape = new Circle({
      radius,
      visible,
      id,
      opacity,
      scaleX,
      scaleY,
      skewX,
      skewY,
      rotation,
      offsetX,
      offsetY,
      fill: fillColor,
      fillPatternImage: fillPatternImage
        ? Object.assign(new Image(), { src: fillPatternImage.path })
        : undefined,
      fillPatternX,
      fillPatternY,
      fillPatternOffsetX,
      fillPatternOffsetY,
      fillPatternScaleX,
      fillPatternScaleY,
      fillPatternRotation,
      fillPatternRepeat,
    });
  }

  get radius() {
    return this.shape.radius();
  }
  set radius(v) {
    this.shape.radius(v);
    this.#redraw();
  }
  get visible() {
    return this.shape.visible();
  }
  set visible(v) {
    this.shape.visible(v);
    this.#redraw();
  }
  get id() {
    return this.shape.id();
  }
  set id(v) {
    this.shape.id(v);
    this.#redraw();
  }
  get opacity() {
    return this.shape.opacity();
  }
  set opacity(v) {
    this.shape.opacity(v);
    this.#redraw();
  }
  get scaleX() {
    return this.shape.scaleX();
  }
  set scaleX(v) {
    this.shape.scaleX(v);
    this.#redraw();
  }
  get scaleY() {
    return this.shape.scaleY();
  }
  set scaleY(v) {
    this.shape.scaleY(v);
    this.#redraw();
  }
  get skewX() {
    return this.shape.skewX();
  }
  set skewX(v) {
    this.shape.skewX(v);
    this.#redraw();
  }
  get skewY() {
    return this.shape.skewY();
  }
  set skewY(v) {
    this.shape.skewY(v);
    this.#redraw();
  }
  get rotation() {
    return this.shape.rotation();
  }
  set rotation(v) {
    this.shape.rotation(v);
    this.#redraw();
  }
  get offsetX() {
    return this.shape.offsetX();
  }
  set offsetX(v) {
    this.shape.offsetX(v);
    this.#redraw();
  }
  get offsetY() {
    return this.shape.offsetY();
  }
  set offsetY(v) {
    this.shape.offsetY(v);
    this.#redraw();
  }
  get fillColor() {
    return this.shape.fill().toString();
  }
  set fillColor(v) {
    this.shape.fill(v);
    this.#redraw();
  }
  /** @returns {NfFile | undefined} */
  get fillPatternImage() {
    return this.#fillPatternImage;
  }
  /** @param {NfFile} v */
  set fillPatternImage(v) {
    this.#fillPatternImage = v;
    this.shape.fillPatternImage(v ? Object.assign(new Image(), { src: v.path }) : undefined);
    this.#redraw();
  }
  get fillPatternX() {
    return this.shape.fillPatternX();
  }
  set fillPatternX(v) {
    this.shape.fillPatternX(v);
    this.#redraw();
  }
  get fillPatternY() {
    return this.shape.fillPatternY();
  }
  set fillPatternY(v) {
    this.shape.fillPatternY(v);
    this.#redraw();
  }
  get fillPatternOffsetX() {
    return this.shape.fillPatternOffsetX();
  }
  set fillPatternOffsetX(v) {
    this.shape.fillPatternOffsetX(v);
    this.#redraw();
  }
  get fillPatternOffsetY() {
    return this.shape.fillPatternOffsetY();
  }
  set fillPatternOffsetY(v) {
    this.shape.fillPatternOffsetY(v);
    this.#redraw();
  }
  get fillPatternScaleX() {
    return this.shape.fillPatternScaleX();
  }
  set fillPatternScaleX(v) {
    this.shape.fillPatternScaleX(v);
    this.#redraw();
  }
  get fillPatternScaleY() {
    return this.shape.fillPatternScaleY();
  }
  set fillPatternScaleY(v) {
    this.shape.fillPatternScaleY(v);
    this.#redraw();
  }
  get fillPatternRotation() {
    return this.shape.fillPatternRotation();
  }
  set fillPatternRotation(v) {
    this.shape.fillPatternRotation(v);
    this.#redraw();
  }
  get fillPatternRepeat() {
    return this.shape.fillPatternRepeat();
  }
  set fillPatternRepeat(v) {
    this.shape.fillPatternRepeat(v);
    this.#redraw();
  }

  /** @param {Layer} layer */
  addToLayer(layer) {
    if (this.shape.getParent() !== layer) layer.add(this.shape);
  }

  #redraw() {
    this.shape.getLayer()?.batchDraw();
  }
}
// * Required to generate code
export default DrawableCircle2D.name;

// * Required for the editor to display the component and generate code
/** @type {EditorComponentManifest} */
export const EDITOR_COMPONENT_MANIFEST = {
  name: "DrawableCircle2D",
  description: "Graphically drawable circle 2D",
  params: [
    {
      name: "radius",
      type: "number",
      description: "Radius of the circle in pixels",
      default: 10,
      optional: false,
    },
    {
      name: "visible",
      type: "boolean",
      description: "Controls whether the node is rendered",
      default: true,
      optional: false,
    },
    {
      name: "id",
      type: "string",
      description: "Unique identifier for the node, used with stage.findOne('#id')",
      optional: true,
    },
    {
      name: "opacity",
      type: "number",
      description: "Opacity from 0 (transparent) to 1 (fully opaque)",
      default: 1,
      optional: true,
    },
    {
      name: "scaleX",
      type: "number",
      description: "Horizontal scale factor",
      default: 1,
      optional: true,
    },
    {
      name: "scaleY",
      type: "number",
      description: "Vertical scale factor",
      default: 1,
      optional: true,
    },
    {
      name: "skewX",
      type: "number",
      default: 0,
      description: "Horizontal skew in radians, shears along the X axis",
      optional: true,
    },
    {
      name: "skewY",
      type: "number",
      default: 0,
      description: "Vertical skew in radians, shears along the Y axis",
      optional: true,
    },
    {
      name: "rotation",
      type: "number",
      description:
        "Rotation angle in degrees applied around the offset point (positive values rotate clockwise)",
      default: 0,
      optional: true,
    },
    {
      name: "offsetX",
      type: "number",
      description: "Horizontal offset for the transform origin",
      default: 0,
      optional: true,
    },
    {
      name: "offsetY",
      type: "number",
      description: "Vertical offset for the transform origin",
      default: 0,
      optional: true,
    },
    {
      name: "fillColor",
      type: "string",
      description:
        'Solid fill color as a CSS color string (e.g. "red", "#ff0000", "rgba(255,0,0,0.5)"), or a pre-built CanvasGradient object',
      default: "red",
      example: "rgb(255,255,255)",
      optional: true,
    },
    {
      name: "fillPatternImage",
      type: "asset",
      description: "Image element to use as a tiling pattern fill",
      optional: true,
    },
    {
      name: "fillPatternX",
      type: "number",
      description:
        "Horizontal offset of the pattern origin relative to the shape's top-left corner, in pixels",
      optional: true,
    },
    {
      name: "fillPatternY",
      type: "number",
      description:
        "Vertical offset of the pattern origin relative to the shape's top-left corner, in pixels",
      optional: true,
    },
    {
      name: "fillPatternOffsetX",
      type: "number",
      description: "Horizontally shifts the pattern image within the tile before repeating",
      optional: true,
    },
    {
      name: "fillPatternOffsetY",
      type: "number",
      description: "Vertically shifts the pattern image within the tile before repeating",
      optional: true,
    },
    {
      name: "fillPatternScaleX",
      type: "number",
      description: "Horizontal scale factor for the pattern tile",
      optional: true,
    },
    {
      name: "fillPatternScaleY",
      type: "number",
      description: "Vertical scale factor for the pattern tile",
      optional: true,
    },
    {
      name: "fillPatternRotation",
      type: "number",
      description: "Rotation of the pattern tile in degrees",
      optional: true,
    },
    {
      name: "fillPatternRepeat",
      type: "string",
      description:
        'Repeat mode for the pattern. One of "repeat" (default), "repeat-x", "repeat-y", or "no-repeat"',
      optional: true,
    },
  ],
};
