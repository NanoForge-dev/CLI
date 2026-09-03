import { type <%= appClass %> } from "@nanoforge-dev/core";
import { type Registry } from "@nanoforge-dev/ecs";

export async function beforeRegistryInit(app: <%= appClass %>, registry: Registry) {
  // Actions before registry components, entities and systems initialization
}
