/**
 * @typedef {import("@nanoforge-dev/core").<%= appClass %>} <%= appClass %>
 */

/**
 * Actions that are executed before the application initialization
 * But are executed after base libraries addition
 * @param {<%= appClass %>} app - Nanoforge <%= part %> instance
 * @returns {Promise<void>}
 */
export async function beforeInit(app) {
  // Actions before app initialization
}
