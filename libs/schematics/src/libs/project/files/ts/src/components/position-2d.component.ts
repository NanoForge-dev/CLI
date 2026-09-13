import type { EditorComponentManifest } from "@nanoforge-dev/ecs";

export class Position2D {
  name = this.constructor.name;

  constructor(
    public x: number,
    public y: number,
  ) {}
}

// * Required to generate code
export default Position2D.name;

// * Required for the editor to display the component and generate code
export const EDITOR_COMPONENT_MANIFEST: EditorComponentManifest = {
  name: "Position2D",
  description: "Position of an entity in a 2 dimensional space in pixel",
  params: [
    {
      type: "number",
      name: "x",
      description: "Horizontal position in pixel",
      example: 4.2,
      default: 0,
    },
    {
      type: "number",
      name: "y",
      description: "Vertical position in pixel",
      example: 67,
      default: 0,
    },
  ],
};
