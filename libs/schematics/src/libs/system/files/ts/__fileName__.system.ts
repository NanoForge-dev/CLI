import { type Context } from "@nanoforge-dev/common";
import { type EditorSystemManifest, type Registry } from "@nanoforge-dev/ecs";

// Position2D comes with every new project: replace it with the components this system works on.
import { Position2D } from "../components/position-2d.component";

export const <%= functionName %>System = (registry: Registry, ctx: Context) => {
  const entities = registry.getZipper([Position2D]);

  entities.forEach(({ Position2D }) => {
    if (Position2D.x > 1000) ctx.app.requestStop();
  });
};

// * Required to generate code
export default <%= functionName %>System.name;

// * Required for the editor to display the system and generate code
export const EDITOR_SYSTEM_MANIFEST: EditorSystemManifest = {
  name: "<%= functionName %>",
  description: "This system ends the game once an entity with Position2D goes past x = 1000",
  dependencies: ["Position2D"],
};
