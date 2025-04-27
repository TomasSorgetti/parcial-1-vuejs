import palettes from "../data/palettes.js";

export const getRandomPalette = (category = "any", mode = "any") => {
  let filteredPalettes = palettes;

  if (category !== "any") {
    filteredPalettes = filteredPalettes.filter(
      (palette) => palette.category === category
    );
  }

  if (mode !== "any") {
    filteredPalettes = filteredPalettes.filter(
      (palette) => palette.mode === mode
    );
  }

  if (filteredPalettes.length === 0) {
    return [];
  }

  const randomIndex = Math.floor(Math.random() * filteredPalettes.length);

  return filteredPalettes[randomIndex];
};
