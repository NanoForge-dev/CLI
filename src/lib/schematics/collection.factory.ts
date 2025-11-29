import { Runner, RunnerFactory } from "../runner";
import { SchematicRunner } from "../runner/runners/schematic.runner";
import { AbstractCollection } from "./abstract.collection";
import { Collection } from "./collection";
import { NanoforgeCollection } from "./nanoforge.collection";

export class CollectionFactory {
  public static create(collection: Collection | string, directory: string): AbstractCollection {
    const schematicRunner = RunnerFactory.create(Runner.SCHEMATIC) as SchematicRunner;

    if (collection === Collection.NANOFORGE) {
      return new NanoforgeCollection(schematicRunner, directory);
    } else {
      return new NanoforgeCollection(schematicRunner, directory);
    }
  }
}
