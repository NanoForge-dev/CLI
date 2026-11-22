import { definePacket } from "@nanoforge-dev/network";

/**
 * Server to every client, each tick: where the entity is. The client and the server declare it
 * with the same name.
 *
 * @type {import("@nanoforge-dev/network").PacketDefinition<{ x: number; y: number }>}
 */
export const PositionPacket = definePacket("position", {
  // Never trust what arrives from the network: anything but two numbers is dropped.
  /** @returns {data is { x: number; y: number }} */
  validate: (data) =>
    typeof data === "object" &&
    data !== null &&
    "x" in data &&
    typeof data.x === "number" &&
    "y" in data &&
    typeof data.y === "number",
});
