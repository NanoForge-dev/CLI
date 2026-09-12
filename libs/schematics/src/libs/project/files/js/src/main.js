import { NanoforgeFactory } from "nanoforge";
import { EcsLibrary } from "@nanoforge-dev/ecs/<%= part %>";<% if (part === "client") { %>
import { Graphics2DLibrary } from "@nanoforge-dev/graphics-2d";
import { InputLibrary } from "@nanoforge-dev/input";<% } %>
import { <%= part === "client" ? "NetworkClientLibrary" : "NetworkServerLibrary" %> } from "@nanoforge-dev/network/<%= part %>";
<% if (part === "client") { %>
import { DrawableCircle2D } from "./components/drawable-circle-2d.component";<% } %>
import { Position2D } from "./components/position-2d.component";<% if (part === "client") { %>
import { draw2D } from "./systems/draw-2d.system";<% if (hasServer) { %>
import { positionSync } from "./systems/position-sync.system";<% } %><% } else { %>
import { move2D } from "./systems/move-2d.system";<% } %>

/**
 * @param {import("nanoforge").<%= part === "client" ? "ClientRunOptions" : "ServerRunOptions" %>} options
 * @returns {Promise<void>}
 */
export const main = async (options) => {
  const app = NanoforgeFactory.<%= part === "client" ? "createClient" : "createServer" %>({ tickRate: 60 });

  const ecs = new EcsLibrary();
  app.use(ecs);<% if (part === "client") { %>
  app.use(new Graphics2DLibrary());
  app.use(new InputLibrary());<% } %>
  app.use(new <%= part === "client" ? "NetworkClientLibrary" : "NetworkServerLibrary" %>());

  await app.init(options);

  const registry = ecs.registry;
<% if (part === "client") { %>
  const circle = registry.spawnEntity();
  registry.addComponent(circle, new Position2D(500, 500));
  registry.addComponent(circle, new DrawableCircle2D(75, true, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, "red"));

  registry.addSystem(draw2D);<% if (hasServer) { %>
  registry.addSystem(positionSync);<% } %>
<% } else { %>
  const entity = registry.spawnEntity();
  registry.addComponent(entity, new Position2D(500, 500));

  registry.addSystem(move2D);
<% } %>
  await app.run();
};
