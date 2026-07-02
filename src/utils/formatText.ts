// src/utils/formatText.ts
type Node =
  | { type: "text"; value: string }
  | { type: "line-break" }
  | { type: "bold"; children: Node[] }
  | { type: "extra-bold"; children: Node[] }
  | { type: "primary-color"; children: Node[] };

const TAG_PATTERN =
  /(\[bold\]|\[\/bold\]|\[extra-bold\]|\[\/extra-bold\]|\[primary-color\]|\[\/primary-color\]|\[\/line-break\])/g;

function tokenize(input: string): string[] {
  return input.split(TAG_PATTERN).filter((token) => token.length > 0);
}

function parse(input: string): Node[] {
  const tokens = tokenize(input);
  const root: Node[] = [];
  const stack: Node[][] = [root];

  for (const token of tokens) {
    const current = stack[stack.length - 1];

    switch (token) {
      case "[bold]": {
        const node: Node = { type: "bold", children: [] };
        current.push(node);
        stack.push(node.children);
        break;
      }
      case "[/bold]": {
        if (stack.length > 1) stack.pop();
        break;
      }
      case "[extra-bold]": {
        const node: Node = { type: "extra-bold", children: [] };
        current.push(node);
        stack.push(node.children);
        break;
      }
      case "[/extra-bold]": {
        if (stack.length > 1) stack.pop();
        break;
      }
      case "[primary-color]": {
        const node: Node = { type: "primary-color", children: [] };
        current.push(node);
        stack.push(node.children);
        break;
      }
      case "[/primary-color]": {
        if (stack.length > 1) stack.pop();
        break;
      }
      case "[/line-break]": {
        current.push({ type: "line-break" });
        break;
      }
      default: {
        current.push({ type: "text", value: token });
        break;
      }
    }
  }

  return root;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function render(nodes: Node[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case "text":
          return escapeHtml(node.value);
        case "line-break":
          return "<br class=\"block mt-4 content-['']\" />";
        case "bold":
          return `<strong class="font-bold">${render(node.children)}</strong>`;
        case "extra-bold":
          return `<strong class="font-extrabold">${render(node.children)}</strong>`;
        case "primary-color":
          return `<span class="text-[var(--color-tertiary)]">${render(node.children)}</span>`;
      }
    })
    .join("");
}

export function formatText(input: string): string {
  return render(parse(input));
}
