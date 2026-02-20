import { RunnerFactory } from "@lib/runner";

import { type AbstractCollection } from "./abstract.collection";
import { Collection } from "./collection";
import { NanoforgeCollection } from "./nanoforge.collection";

export class CollectionFactory {
  public static create(collection: Collection | string, directory: string): AbstractCollection {
    const schematicRunner = RunnerFactory.createSchematic();

    if (collection === Collection.NANOFORGE) {
      return new NanoforgeCollection(schematicRunner, directory);
    }
    throw new Error(`Unknown collection: ${collection}`);
  }
}
