import { useMemo } from "react";

export interface PosterSequenceItem {
  index: number;
  title: string;
  year: number;
  mediaType: "movie" | "tv";
}

export function usePosterSequence(totalSteps: number): PosterSequenceItem[] {
  return useMemo(
    () =>
      Array.from({ length: totalSteps }, (_, index) => ({
        index,
        title: `Poster #${index + 1}`,
        year: 2020 + (index % 5),
        mediaType: index % 2 === 0 ? "movie" : "tv"
      })),
    [totalSteps]
  );
}
