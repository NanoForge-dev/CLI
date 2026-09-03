/**
 * @typedef {import("@nanoforge-dev/ecs-<%= part %>").EditorComponentManifest} EditorComponentManifest
 */

export class ExampleComponent {
  static name = "ExampleComponent";
  name = this.constructor.name;

  paramA;
  paramB;
  paramC;

  /**
   * Example component constructor
   * @param {string} paramA
   * @param {number} paramB
   * @param {boolean} [paramC = false]
   */
  constructor(paramA, paramB, paramC = false) {
    this.paramA = paramA;
    this.paramB = paramB;
    this.paramC = paramC;
  }

  get foo() {
    return "bar";
  }

  get paramAOrDefault() {
    return this.paramC ? this.paramA : "default";
  }

  addOne() {
    this.paramB += 1;
  }
}

// * Required to generate code
export default ExampleComponent.name;

/**
 * Editor component manifest
 * * Required for the editor to display the component and generate code
 * @type {EditorComponentManifest}
 */
export const EDITOR_COMPONENT_MANIFEST = {
  name: "Example",
  description: "Example component description",
  params: [
    {
      type: "string",
      name: "paramA",
      description: "Param A description",
      example: "Example value",
    },
    {
      type: "number",
      name: "paramB",
      description: "Param B description",
      example: 3,
    },
    {
      type: "boolean",
      name: "paramC",
      description: "Param C description",
      example: true,
      default: false,
      // Not required because it has a default value
      optional: true,
    },
  ],
};
