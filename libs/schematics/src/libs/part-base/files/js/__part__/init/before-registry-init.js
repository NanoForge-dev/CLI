/**
 * @typedef {import("@nanoforge-dev/core").<%= appClass %>} <%= appClass %>
 * @typedef {import("@nanoforge-dev/ecs").Registry} Registry
 */

/**
 * Actions that are executed before the registry components, entities and systems initialization
 * @param {<%= appClass %>} app - Nanoforge <%= part %> instance
 * @param {Registry} registry - ECS registry instance
 * @returns {Promise<void>}
 */
export async function beforeRegistryInit(app, registry) {
  // Actions before registry components, entities and systems initialization
}
