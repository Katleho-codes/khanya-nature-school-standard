export type Tone = "sun" | "poppy" | "sky" | "meadow";

export interface ToneStyle {
  tint: string;
  solid: string;
  text: string;
  deepText: string;
  border: string;
  dot: string;
  pill: string;
}

const styles: Record<Tone, ToneStyle> = {
  sun: {
    tint: "bg-sun-tint",
    solid: "bg-sun",
    text: "text-ink",
    deepText: "text-sun-deep",
    border: "border-sun-deep",
    dot: "bg-sun-deep",
    pill: "bg-sun-tint text-ink",
  },
  poppy: {
    tint: "bg-poppy-tint",
    solid: "bg-poppy-deep",
    text: "text-white",
    deepText: "text-poppy-deep",
    border: "border-poppy-deep",
    dot: "bg-poppy-deep",
    pill: "bg-poppy-tint text-ink",
  },
  sky: {
    tint: "bg-sky-tint",
    solid: "bg-sky",
    text: "text-ink",
    deepText: "text-sky-deep",
    border: "border-sky-deep",
    dot: "bg-sky-deep",
    pill: "bg-sky-tint text-ink",
  },
  meadow: {
    tint: "bg-meadow-tint",
    solid: "bg-meadow",
    text: "text-ink",
    deepText: "text-meadow-deep",
    border: "border-meadow-deep",
    dot: "bg-meadow-deep",
    pill: "bg-meadow-tint text-ink",
  },
};

const programmeTones: Record<string, Tone> = {
  "little-explorers": "sun",
  "forest-kindy": "meadow",
  "bush-school": "sky",
  "grade-r-pathfinders": "poppy",
  "holiday-programme": "sun",
};

const branchTones: Record<string, Tone> = {
  randburg: "poppy",
  fourways: "sky",
  midstream: "meadow",
};

export function toneStyle(tone: Tone): ToneStyle {
  return styles[tone];
}

export function programmeTone(slug: string | null | undefined): Tone {
  return (slug && programmeTones[slug]) || "sun";
}

export function branchTone(slugOrName: string | null | undefined): Tone {
  const value = (slugOrName ?? "").toLowerCase();
  if (value.includes("randburg") || value.includes("ferndale")) return "poppy";
  if (value.includes("fourways")) return "sky";
  if (value.includes("midstream")) return "meadow";
  const key = Object.keys(branchTones).find((item) => value === item);
  return (key && branchTones[key]) || "sky";
}
