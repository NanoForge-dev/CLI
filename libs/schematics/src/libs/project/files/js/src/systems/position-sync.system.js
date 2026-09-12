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
export function positionSync(registry, ctx) {
  const network = ctx.network;
  const packets = network.tcp
    .getReceivedPackets()
    .map((packet) => JSON.parse(new TextDecoder().decode(packet)));

  const [entity] = registry.getZipper([Position2D]);

  packets.forEach((packet) => {
    entity.Position2D.x = packet.x;
    entity.Position2D.y = packet.y;
  });
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
