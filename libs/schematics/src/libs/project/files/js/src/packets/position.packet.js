import { definePacket } from "@nanoforge-dev/network";

/**
 * Server to every client, each tick: where the entity is. The client and the server declare it with the same name.
 *
 * @type {import("@nanoforge-dev/network").PacketDefinition<{ x: number; y: number }>}
 */
export const PositionPacket = definePacket("position");
