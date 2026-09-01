export const getElementById = (id: string): HTMLElement => {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Could not find element with id ${id}`);
  }
  return el;
};

export const setHiddenStatusOnId = (id: string, hidden: boolean) => {
  const el = getElementById(id);
  el.hidden = hidden;
};

export const addScript = (path: string) => {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = path;
  document.body.appendChild(script);
};
