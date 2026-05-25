import { ArchitectDocument } from "../models/Architect.js";

// Example: styleTags = ["modern", "minimalist", "industrial", ...]
// quizResult = ["modern", "minimalist"]

export function matchArchitectsByStyle(architects: ArchitectDocument[], quizResult: string[]): ArchitectDocument[] {
  // Score architects by overlap with quizResult
  return architects
    .map(arch => ({
      ...arch,
      _matchScore: arch.styleTags.filter(tag => quizResult.includes(tag)).length
    }))
    .filter(arch => arch._matchScore > 0)
    .sort((a, b) => b._matchScore - a._matchScore);
}
