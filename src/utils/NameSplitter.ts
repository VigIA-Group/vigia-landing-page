export function splitFullName(fullName: string): {
  firstNames: string;
  lastNames: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const n = parts.length;

  if (n === 0) return { firstNames: "", lastNames: "" };

  if (n === 1) {
    return { firstNames: parts[0], lastNames: "" };
  }

  if (n === 2) {
    return { firstNames: parts[0], lastNames: parts[1] };
  }

  if (n === 3) {
    return { firstNames: parts[0], lastNames: parts.slice(1).join(" ") };
  }

  if (n === 4) {
    return {
      firstNames: parts.slice(0, 2).join(" "),
      lastNames: parts.slice(2).join(" "),
    };
  }

  return {
    firstNames: parts.slice(0, 2).join(" "),
    lastNames: parts.slice(2).join(" "),
  };
}
