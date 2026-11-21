/** Shared badge styling for a written-answer question result, mirroring the
 * Correct/Wrong treatment MCQ answers already get. Marks can land anywhere between
 * 0 and the question's max (the grader picks any value in that range), so this adds
 * a third "Partial" state for anything in between. */
export function writtenAnswerBadge(marksAwarded: number | null, maxMarks: number) {
  if (marksAwarded === null) {
    return { label: "Not graded yet", pillClass: "warning" };
  }
  if (marksAwarded >= maxMarks) {
    return { label: `Correct · ${marksAwarded}/${maxMarks}`, pillClass: "success" };
  }
  if (marksAwarded <= 0) {
    return { label: `Wrong · ${marksAwarded}/${maxMarks}`, pillClass: "danger" };
  }
  return { label: `Partial · ${marksAwarded}/${maxMarks}`, pillClass: "gold" };
}
