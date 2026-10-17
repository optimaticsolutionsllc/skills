import type { Vector4, Clip, SearchExample } from './data';

/** Cosine similarity: compare angles, not how long the vectors are. */
export function cosineSimilarity(a: Vector4, b: Vector4): number {
  let dot = 0;
  let aa = 0;
  let bb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    aa += a[i] ** 2;
    bb += b[i] ** 2;
  }
  const size = Math.sqrt(aa) * Math.sqrt(bb);
  return size === 0 ? 0 : dot / size;
}

export function rankedClips(query: SearchExample, choices: readonly Clip[], limit = 4) {
  return choices
    .map((clip) => ({ clip, similarity: cosineSimilarity(query.vector, clip.vector) }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}