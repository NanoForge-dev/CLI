import type { EditorSystemManifest, Registry } from "@nanoforge-dev/ecs";
import { type Context } from "nanoforge";

import { DrawableCircle2D } from "../components/drawable-circle-2d.component";
import { Position2D } from "../components/position-2d.component";

export function draw2D(registry: Registry, ctx: Context) {
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
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "draw2D",
  description: "Draw every drawable component",
  dependencies: ["Position2D", "DrawableCircle2D"],
};
