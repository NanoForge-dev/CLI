/**
 * @typedef {import("@nanoforge-dev/ecs").EditorSystemManifest} EditorSystemManifest
 * @typedef {import("@nanoforge-dev/ecs").Registry} Registry
 * @typedef {import("nanoforge").Context} Context
 */

import { DrawableCircle2D } from "../components/drawable-circle-2d.component";
import { Position2D } from "../components/position-2d.component";

/**
 * @param {Registry} registry
 * @param {Context} ctx
 */
export function draw2D(registry, ctx) {
  const graphic2d = ctx.graphics;

  const entities = registry.getZipper([Position2D, DrawableCircle2D]);

  entities.forEach(({ Position2D, DrawableCircle2D }) => {
    DrawableCircle2D.addToLayer(graphic2d.baseLayer);
    DrawableCircle2D.shape.setPosition(Position2D);
  });
}
// * Required to generate code
export default draw2D.name;

// * Required for the editor to display the system and generate code
/** @type {EditorSystemManifest} */
export const EDITOR_SYSTEM_MANIFEST = {
  name: "draw2D",
  description: "Draw every drawable component",
  dependencies: ["Position2D", "DrawableCircle2D"],
};
