import type { EditorSystemManifest, Registry } from "@nanoforge-dev/ecs";
import { type Context } from "nanoforge";

import { Position2D } from "../components/position-2d.component";

export function move2D(registry: Registry, ctx: Context) {
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
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "move2D",
  description: "Moves the entity and broadcasts its position to every connected client",
  dependencies: ["Position2D"],
};
