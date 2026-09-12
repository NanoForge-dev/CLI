import type { EditorSystemManifest, Registry } from "@nanoforge-dev/ecs";
import { type Context } from "nanoforge";

import { Position2D } from "../components/position-2d.component";

export function positionSync(registry: Registry, ctx: Context) {
  const network = ctx.network;
  const packets = network.tcp
    .getReceivedPackets()
    .map((packet) => JSON.parse(new TextDecoder().decode(packet)) as { x: number; y: number });

  const [entity] = registry.getZipper([Position2D]);

  packets.forEach((packet) => {
    entity.Position2D.x = packet.x;
    entity.Position2D.y = packet.y;
  });
}
// * Required to generate code
export default positionSync.name;

// * Required for the editor to display the system and generate code
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "positionSync",
  description: "Overwrites the local entity's position with the latest value received from the server",
  dependencies: ["Position2D"],
};
