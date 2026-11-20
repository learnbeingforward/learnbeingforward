export const CODING_PATTERN_LEVELS = [
  { slug: "level-01", name: "Programming Basics", patternCount: 10 },
  { slug: "level-02", name: "Arrays and Strings", patternCount: 6 },
  { slug: "level-03", name: "Searching and Sorting", patternCount: 6 },
  { slug: "level-04", name: "Hashing", patternCount: 4 },
  { slug: "level-05", name: "Linked Lists", patternCount: 5 },
  { slug: "level-06", name: "Stacks and Queues", patternCount: 4 },
  { slug: "level-07", name: "Recursion and Backtracking", patternCount: 4 },
  { slug: "level-08", name: "Trees", patternCount: 5 },
  { slug: "level-09", name: "Heaps", patternCount: 3 },
  { slug: "level-10", name: "Graphs", patternCount: 7 },
  { slug: "level-11", name: "Greedy", patternCount: 3 },
  { slug: "level-12", name: "Dynamic Programming", patternCount: 8 },
  { slug: "level-13", name: "Bit Manipulation", patternCount: 3 },
  { slug: "level-14", name: "Advanced Patterns", patternCount: 4 },
] as const;

export const TOTAL_CODING_PATTERNS = CODING_PATTERN_LEVELS.reduce((sum, l) => sum + l.patternCount, 0);
