import { definePacket } from "@nanoforge-dev/network";

/** Server to every client, each tick: where the entity is. The client and the server declare it with the same name. */
export const PositionPacket = definePacket<{ x: number; y: number }>("position");
