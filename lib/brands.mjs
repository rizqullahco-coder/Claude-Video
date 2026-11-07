// Brand kits. A project picks one with "brandKit": "<id>".
// The kit supplies the logo files (for light, dark and coloured backgrounds),
// the wordmark under the end-card logo and the default end-card tagline.
export const BRANDS = {
  rizco: {
    name: "Riz.co",
    wordmark: "RIZ.CO",
    tagline: "Build Your Rizq. Don't Wait for It.",
    logo: {
      darkInk: "brand/rizco/rizco-logo-dark-ink.png", // light backgrounds: black R, olive z
      lightInk: "brand/rizco/rizco-logo-light-ink.png", // dark backgrounds: ivory R, light olive z
      mono: "brand/rizco/rizco-logo-mono-dark.png", // coloured backgrounds: all ink
    },
  },
  rizq: {
    name: "RIZQ",
    wordmark: "",
    tagline: "",
    logo: { darkInk: "brand/rizq-logo-dark-ink.png", lightInk: "brand/rizq-logo-light-ink.png", mono: "brand/rizq-logo-mono-dark.png" },
  },
};

export const brandKit = (p) => {
  const kit = BRANDS[p.brandKit || "rizq"];
  if (!kit) throw new Error(`Unknown brandKit "${p.brandKit}". Options: ${Object.keys(BRANDS).join(", ")}`);
  return { ...kit, logo: { ...kit.logo, ...(p.logo || {}) } };
};

/** Tagline as HTML with a line break after each sentence ("A. B." -> "A.<br>B."). */
export const taglineHtml = (text, esc) => esc(text).replace(/([.!?]) (?=\S)/g, "$1<br>");
