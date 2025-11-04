import { bgRgb } from "ansis";

export const Prefixes = {
  INFO: bgRgb(60, 190, 100).bold.rgb(0, 0, 0)(" Info "),
  ERROR: bgRgb(210, 0, 75).bold.rgb(0, 0, 0)(" Error "),
};
