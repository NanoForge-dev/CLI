import { type Config } from "@utils/config/config.type";
import { deepMerge } from "@utils/object";
import { type DeepPartial } from "@utils/types";

export class ConfigDeclarator {
  public declare(baseContent: string, options: DeepPartial<Config>): string {
    const content = JSON.parse(baseContent);
    return JSON.stringify(deepMerge(content, options), null, 2);
  }
}
