import { getNodeBinaryPath } from "@utils/path";

import { AbstractRunner } from "../abstract.runner";

export class LocalBunRunner extends AbstractRunner {
  constructor() {
    super(getNodeBinaryPath("bun"));
  }
}
