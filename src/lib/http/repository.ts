import { ApiRequestError } from "@utils/errors";

import type { HttpClient, RequestOptions } from "./http-client";

export class Repository {
  private readonly _client: HttpClient;

  constructor(client: HttpClient) {
    this._client = client;
  }

  get<R extends object = object>(path: string, options?: RequestOptions): Promise<R> {
    return this.runRequest("get", path, options);
  }

  getFile(path: string, options?: RequestOptions): Promise<Blob> {
    return this.runFileRequest("get", path, options);
  }

  post<R extends object = object, I extends object = object>(
    path: string,
    body?: I | FormData,
    options?: RequestOptions,
  ): Promise<R> {
    return this.runRequestBody("post", path, body ?? {}, options);
  }

  put<R extends object = object, I extends object = object>(
    path: string,
    body?: I | FormData,
    options?: RequestOptions,
  ): Promise<R> {
    return this.runRequestBody("put", path, body ?? {}, options);
  }

  patch<R extends object = object, I extends object = object>(
    path: string,
    body?: I | FormData,
    options?: RequestOptions,
  ): Promise<R> {
    return this.runRequestBody("patch", path, body ?? {}, options);
  }

  delete<R extends object = object>(path: string, options?: RequestOptions): Promise<R> {
    return this.runRequest("delete", path, options);
  }

  private async runRequest<R>(
    request: "get" | "delete",
    path: string,
    options?: RequestOptions,
  ): Promise<R> {
    const res = await this._client[request](path, options);
    const data = (await res.json()) as R;
    if (!res.ok) throw new ApiRequestError(res.status, data["error" as keyof R]);
    return data;
  }

  private async runFileRequest(
    request: "get",
    path: string,
    options?: RequestOptions,
  ): Promise<Blob> {
    const res = await this._client[request](path, options);
    if (!res.ok)
      throw new ApiRequestError(res.status, ((await res.json()) as { error: any })["error"]);
    return await res.blob();
  }

  private async runRequestBody<R, I>(
    request: "post" | "put" | "patch",
    path: string,
    body?: I | FormData,
    options?: RequestOptions,
  ): Promise<R> {
    const res = await this._client[request](
      path,
      body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
      options,
    );
    const data = (await res.json()) as R;
    if (!res.ok) throw new ApiRequestError(res.status, data["error" as keyof R]);
    return data;
  }
}
