import { toKebabCase } from "@utils/formatting";

export class SchematicOption {
  constructor(
    private name: string,
    private value: boolean | string | Array<SchematicOption>,
  ) {}

  get normalizedName() {
    return toKebabCase(this.name);
  }

  public toCommandString(prefix?: string): string[] {
    const normalizedName = `${prefix ? `${prefix}.` : ""}${this.normalizedName}`;
    if (typeof this.value === "string") {
      if (this.name === "name") {
        return [`--${normalizedName}=${this.format()}`];
      } else if (this.name === "version" || this.name === "path") {
        return [`--${normalizedName}=${this.value}`];
      } else {
        return [`--${normalizedName}="${this.value}"`];
      }
    } else if (typeof this.value === "boolean") {
      const str = normalizedName;
      return this.value ? [`--${str}`] : [`--no-${str}`];
    } else if (Array.isArray(this.value)) {
      return this.value.reduce(
        (old: string[], option: SchematicOption) => [
          ...old,
          ...option.toCommandString(normalizedName),
        ],
        [],
      );
    } else {
      return [`--${normalizedName}=${this.value}`];
    }
  }

  private format() {
    return toKebabCase(this.value as string)
      .split("")
      .reduce((content, char) => {
        if (char === "(" || char === ")" || char === "[" || char === "]") {
          return `${content}\\${char}`;
        }
        return `${content}${char}`;
      }, "");
  }
}
