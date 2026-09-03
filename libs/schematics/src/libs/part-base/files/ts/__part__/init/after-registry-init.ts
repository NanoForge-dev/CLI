import { type <%= appClass %> } from "@nanoforge-dev/core";
import { type Registry } from "@nanoforge-dev/ecs";

export async function afterRegistryInit(app: <%= appClass %>, registry: Registry) {
  // Actions after registry components, entities and systems initialization
}
