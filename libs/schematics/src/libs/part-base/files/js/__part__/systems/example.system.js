/**
 * @typedef {import("@nanoforge-dev/common").Context} Context
 * @typedef {import("@nanoforge-dev/ecs-<%= part %>").EditorSystemManifest} EditorSystemManifest
 * @typedef {import("@nanoforge-dev/ecs-<%= part %>").Registry} Registry
 */

import { ExampleComponent } from "../components/example.component";

/**
 * Example system
 * This system end the game when paramB reaches 0 for any entity with ExampleComponent
 * @param {Registry} registry - ECS registry instance
 * @param {Context} ctx - Nanoforge <%= part %> instance
 */
export const exampleSystem = (registry, ctx) => {
  const entities = registry.getZipper([ExampleComponent]);

  entities.forEach((entity) => {
    if (entity.ExampleComponent.paramA === "end") {
      ctx.app.setIsRunning(false);
      return;
    }

    if (entity.ExampleComponent.paramB === 0) entity.ExampleComponent.paramA = "end";

    if (entity.ExampleComponent.paramB >= 0)
      entity.ExampleComponent.paramB = entity.ExampleComponent.paramB - 1;
  });
};

// * Required to generate code
export default exampleSystem.name;

/**
 * Editor component manifest
 * * Required for the editor to display the system and generate code
 * @type {EditorSystemManifest}
 */
export const EDITOR_SYSTEM_MANIFEST = {
  name: "Example",
  description:
    "This system end the game when paramB reaches 0 for any entity with ExampleComponent",
  dependencies: ["ExampleComponent"],
};
