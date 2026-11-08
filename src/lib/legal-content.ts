export type LegalBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

// Parses the simple format used in LegalPage.content: blank-line-separated
// paragraphs, "## " headings, and "- " list items.
export function parseLegalContent(content: string): LegalBlock[] {
  const blocks: LegalBlock[] = [];
  const paragraphs = content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  for (const p of paragraphs) {
    if (p.startsWith("## ")) {
      blocks.push({ type: "heading", text: p.slice(3).trim() });
    } else if (p.split("\n").every((line) => line.trim().startsWith("- "))) {
      blocks.push({ type: "list", items: p.split("\n").map((line) => line.trim().slice(2).trim()) });
    } else {
      blocks.push({ type: "paragraph", text: p });
    }
  }
  return blocks;
}
