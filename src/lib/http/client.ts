import { REGISTRY_URL } from "@lib/constants";

import { RegistryAuthenticationError } from "@utils/errors";

import { HttpClient } from "./http-client";
import { Repository } from "./repository";

const client = new HttpClient(REGISTRY_URL ?? "");

export const api = new Repository(client);

export const withAuth = (
  apiKey?: string,
  force: boolean = false,
  headers: object = {
    "Content-Type": "application/json",
  },
) => {
  if (!apiKey && force) {
    throw new RegistryAuthenticationError();
  }
  return new Repository(
    new HttpClient(REGISTRY_URL ?? "", {
      headers: {
        Authorization: apiKey,
        ...headers,
      },
    }),
  );
};
