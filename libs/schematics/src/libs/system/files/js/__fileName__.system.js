/**
 * @typedef {import("@nanoforge-dev/common").Context} Context
 * @typedef {import("@nanoforge-dev/ecs").EditorSystemManifest} EditorSystemManifest
 * @typedef {import("@nanoforge-dev/ecs").Registry} Registry
 */

// Position2D comes with every new project: replace it with the components this system works on.
import { Position2D } from "../components/position-2d.component";

/**
 * <%= functionName %> system
 * This system ends the game once an entity with Position2D goes past x = 1000
 * @param {Registry} registry - ECS registry instance
 * @param {Context} ctx - Nanoforge <%= part %> instance
 */
export const <%= functionName %>System = (registry, ctx) => {
  const entities = registry.getZipper([Position2D]);

  entities.forEach(({ Position2D }) => {
    if (Position2D.x > 1000) ctx.app.requestStop();
  });
};

// * Required to generate code
export default <%= functionName %>System.name;

/**
 * Editor component manifest
 * * Required for the editor to display the system and generate code
 * @type {EditorSystemManifest}
 */
export const EDITOR_SYSTEM_MANIFEST = {
  name: "<%= functionName %>",
  description: "This system ends the game once an entity with Position2D goes past x = 1000",
  dependencies: ["Position2D"],
};
