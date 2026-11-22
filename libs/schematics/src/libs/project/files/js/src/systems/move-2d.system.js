/**
 * @typedef {import("@nanoforge-dev/common").Context} Context
 * @typedef {import("@nanoforge-dev/ecs").EditorSystemManifest} EditorSystemManifest
 * @typedef {import("@nanoforge-dev/ecs").Registry} Registry
 */

import { Position2D } from "../components/position-2d.component";
import { PositionPacket } from "../packets/position.packet";

/**
 * @param {Registry} registry
 * @param {Context} ctx
 */
export function move2D(registry, ctx) {
  const entities = registry.getZipper([Position2D]);

  entities.forEach(({ Position2D }) => {
    Position2D.x += 1;

    ctx.network.packets.sendToAll(PositionPacket, { x: Position2D.x, y: Position2D.y });
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
