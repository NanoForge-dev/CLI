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
export function positionSync(registry, ctx) {
  const position = ctx.network.packets.read(PositionPacket).at(-1)?.data;
  const [entity] = registry.getZipper([Position2D]);
  if (!position || !entity) return;

  entity.Position2D.x = position.x;
  entity.Position2D.y = position.y;
}
// * Required to generate code
export default positionSync.name;

// * Required for the editor to display the system and generate code
/** @type {EditorSystemManifest} */
export const EDITOR_SYSTEM_MANIFEST = {
  name: "positionSync",
  description: "Overwrites the local entity's position with the latest value received from the server",
  dependencies: ["Position2D"],
};
