import { REGISTRY_URL } from "@lib/constants";

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
    console.error("No registry key found. Please use `nf login` to login");
    throw new Error("No apikey found. Please use `nf login` to login");
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
