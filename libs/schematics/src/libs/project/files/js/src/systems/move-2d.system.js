/**
 * @typedef {import("@nanoforge-dev/ecs").EditorSystemManifest} EditorSystemManifest
 * @typedef {import("@nanoforge-dev/ecs").Registry} Registry
 * @typedef {import("nanoforge").Context} Context
 */

import { Position2D } from "../components/position-2d.component";

/**
 * @param {Registry} registry
 * @param {Context} ctx
 */
export function move2D(registry, ctx) {
  const network = ctx.network;
  const entities = registry.getZipper([Position2D]);

  entities.forEach(({ Position2D }) => {
    Position2D.x += 1;

    network.tcp.sendToEverybody(
      new TextEncoder().encode(JSON.stringify({ x: Position2D.x, y: Position2D.y })),
    );
  });
}
// * Required to generate code
export default move2D.name;

// * Required for the editor to display the system and generate code
/** @type {EditorSystemManifest} */
export const EDITOR_SYSTEM_MANIFEST = {
  name: "move2D",
  description: "Moves the entity and broadcasts its position to every connected client",
  dependencies: ["Position2D"],
};
