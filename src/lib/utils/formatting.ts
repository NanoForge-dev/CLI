export const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
};

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
