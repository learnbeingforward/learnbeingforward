import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CodingPatternViewer } from "@/components/lbf/CodingPatternViewer";

const LEVELS: Record<string, string> = {
  "level-01": "Programming Basics",
  "level-02": "Arrays and Strings",
  "level-03": "Searching and Sorting",
  "level-04": "Hashing",
  "level-05": "Linked Lists",
  "level-06": "Stacks and Queues",
  "level-07": "Recursion and Backtracking",
  "level-08": "Trees",
  "level-09": "Heaps",
  "level-10": "Graphs",
  "level-11": "Greedy",
  "level-12": "Dynamic Programming",
  "level-13": "Bit Manipulation",
  "level-14": "Advanced Patterns",
};

export async function generateMetadata({ params }: PageProps<"/coding-patterns/[level]">): Promise<Metadata> {
  const { level } = await params;
  const name = LEVELS[level];
  if (!name) return {};
  return { title: `${name} — Coding Pattern Artifacts` };
}

export default async function CodingPatternLevelPage({ params }: PageProps<"/coding-patterns/[level]">) {
  const { level } = await params;
  const name = LEVELS[level];
  if (!name) notFound();

  return <CodingPatternViewer level={level} name={name} />;
}
