import type { Context } from "@nanoforge-dev/common";
import type { EditorSystemManifest, Registry } from "@nanoforge-dev/ecs";

// Types ctx.network for this file on its own (main.ts already loads the library).
import "@nanoforge-dev/network/client";

import { Position2D } from "../components/position-2d.component";
import { PositionPacket } from "../packets/position.packet";

export function positionSync(registry: Registry, ctx: Context) {
  const position = ctx.network.packets.read(PositionPacket).at(-1)?.data;
  const [entity] = registry.getZipper([Position2D]);
  if (!position || !entity) return;

  entity.Position2D.x = position.x;
  entity.Position2D.y = position.y;
}
// * Required to generate code
export default positionSync.name;

// * Required for the editor to display the system and generate code
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "positionSync",
  description: "Overwrites the local entity's position with the latest value received from the server",
  dependencies: ["Position2D"],
};
