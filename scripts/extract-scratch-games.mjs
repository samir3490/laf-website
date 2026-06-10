import pages from "../src/content/pages.json" with { type: "json" };

const html = pages["community-scratch-games"]?.html ?? "";
const ids = [...new Set([...html.matchAll(/projects\/(\d+)/g)].map((m) => m[1]))];
console.log("Scratch project IDs:", ids);
