import { Channel, definePacket } from "@nanoforge-dev/network";

/**
 * Server to every client, each tick: where the entity is. The client and the server declare it
 * with the same name. A position is replaced every tick, so a lost one is not sent again.
 *
 * @type {import("@nanoforge-dev/network").PacketDefinition<{ x: number; y: number }>}
 */
export const PositionPacket = definePacket("position", {
  channel: Channel.UnreliableOrdered,
  // Never trust what arrives from the network: anything but two numbers is dropped.
  /** @returns {data is { x: number; y: number }} */
  validate: (data) =>
    typeof data === "object" &&
    data !== null &&
    typeof data.x === "number" &&
    typeof data.y === "number",
});
