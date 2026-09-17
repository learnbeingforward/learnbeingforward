export const AUTO_BATCH_CAP = 50;
export const MANUAL_BATCH_CAP = 60;

const MAX_BATCH_SIZE = AUTO_BATCH_CAP;

export type Batchable = { id: string; enrolledAt: Date };

export function chunkIntoBatches<T extends Batchable>(
  enrollments: T[],
  cap: number = MAX_BATCH_SIZE
): T[][] {
  const n = enrollments.length;
  if (n === 0) return [];

  const numBatches = Math.ceil(n / cap);
  const baseSize = Math.floor(n / numBatches);
  const remainder = n % numBatches;

  const sorted = [...enrollments].sort((a, b) => a.enrolledAt.getTime() - b.enrolledAt.getTime());

  const batches: T[][] = [];
  let offset = 0;
  for (let i = 0; i < numBatches; i++) {
    const size = i < remainder ? baseSize + 1 : baseSize;
    batches.push(sorted.slice(offset, offset + size));
    offset += size;
  }

  return batches;
}
