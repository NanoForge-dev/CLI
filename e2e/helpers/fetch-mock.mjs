/**
 * Mocks globalThis.fetch for the CLI subprocess.
 * Loaded via NODE_OPTIONS="--import /path/to/fetch-mock.mjs".
 *
 * Env vars:
 *   MOCK_REGISTRY_STATUS  HTTP status to return (default: 200)
 */
const mockStatus = parseInt(process.env.MOCK_REGISTRY_STATUS ?? "200", 10);

globalThis.fetch = async (_url, _options) => {
  const ok = mockStatus >= 200 && mockStatus < 300;
  const body = ok ? JSON.stringify({ ok: true }) : JSON.stringify({ message: "Unauthorized" });

  return new Response(body, {
    status: mockStatus,
    headers: { "Content-Type": "application/json" },
  });
};
