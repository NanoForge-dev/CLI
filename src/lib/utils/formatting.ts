export function normalizeToKebabCase(str: string) {
  return str
    .replace(/([a-z\d])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/\s/g, "-");
}
