import { Channel, definePacket } from "@nanoforge-dev/network";

/**
 * Server to every client, each tick: where the entity is. The client and the server declare it
 * with the same name. A position is replaced every tick, so a lost one is not sent again.
 */
export const PositionPacket = definePacket<{ x: number; y: number }>("position", {
  channel: Channel.UnreliableOrdered,
  // Never trust what arrives from the network: anything but two numbers is dropped.
  validate: (data): data is { x: number; y: number } =>
    typeof data === "object" &&
    data !== null &&
    typeof (data as { x?: unknown }).x === "number" &&
    typeof (data as { y?: unknown }).y === "number",
});
