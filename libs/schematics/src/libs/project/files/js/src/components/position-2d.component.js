/**
 * @typedef {import("@nanoforge-dev/ecs").EditorComponentManifest} EditorComponentManifest
 */

export class Position2D {
  name = this.constructor.name;

  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// * Required to generate code
export default Position2D.name;

// * Required for the editor to display the component and generate code
/** @type {EditorComponentManifest} */
export const EDITOR_COMPONENT_MANIFEST = {
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
