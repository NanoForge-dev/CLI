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
      const value = this.name === "name" ? toKebabCase(this.value) : this.value;
      return [`--${normalizedName}=${value}`];
    } else if (typeof this.value === "boolean") {
      const str = normalizedName;
      return this.value ? [`--${str}=true`] : [`--${str}=false`];
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
}
