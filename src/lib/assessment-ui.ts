/** Shared badge styling for a written-answer question result, mirroring the
 * Correct/Wrong treatment MCQ answers already get. Marks can land anywhere between
 * 0 and the question's max (the grader picks any value in that range), so this adds
 * a third "Partial" state for anything in between. */
export function writtenAnswerBadge(marksAwarded: number | null, maxMarks: number) {
  if (marksAwarded === null) {
    return { label: "Not graded yet", className: "bg-amber-100 text-amber-700 hover:bg-amber-100" };
  }
  if (marksAwarded >= maxMarks) {
    return { label: `Correct · ${marksAwarded}/${maxMarks}`, className: "bg-green-100 text-green-700 hover:bg-green-100" };
  }
  if (marksAwarded <= 0) {
    return { label: `Wrong · ${marksAwarded}/${maxMarks}`, className: "bg-red-100 text-red-700 hover:bg-red-100" };
  }
  return { label: `Partial · ${marksAwarded}/${maxMarks}`, className: "bg-gold/20 text-indigo hover:bg-gold/20" };
}
