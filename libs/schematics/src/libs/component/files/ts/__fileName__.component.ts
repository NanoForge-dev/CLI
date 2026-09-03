import { type EditorComponentManifest } from "@nanoforge-dev/ecs-<%= part %>";

export class <%= className %>Component {
  name = this.constructor.name;

  constructor(
    public paramA: string,
    public paramB: number,
    public paramC: boolean = false,
  ) {}

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
export default <%= className %>Component.name;

// * Required for the editor to display the component and generate code
export const EDITOR_COMPONENT_MANIFEST: EditorComponentManifest = {
  name: "<%= className %>",
  description: "<%= className %> component description",
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
