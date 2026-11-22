import { definePacket } from "@nanoforge-dev/network";

/**
 * Server to every client, each tick: where the entity is. The client and the server declare it
 * with the same name.
 */
export const PositionPacket = definePacket<{ x: number; y: number }>("position", {
  // Never trust what arrives from the network: anything but two numbers is dropped.
  validate: (data): data is { x: number; y: number } =>
    typeof data === "object" &&
    data !== null &&
    "x" in data &&
    typeof data.x === "number" &&
    "y" in data &&
    typeof data.y === "number",
});
