export const SESSION_SLOT_PRESETS = [
  { slotNumber: 1, label: "Slot 1 — 09:00 to 11:00", startTime: "09:00", endTime: "11:00" },
  { slotNumber: 1, label: "Slot 1 — 09:30 to 11:30", startTime: "09:30", endTime: "11:30" },
  { slotNumber: 2, label: "Slot 2 — 11:15 to 13:15", startTime: "11:15", endTime: "13:15" },
  { slotNumber: 2, label: "Slot 2 — 11:45 to 13:45", startTime: "11:45", endTime: "13:45" },
  { slotNumber: 3, label: "Slot 3 — 14:00 to 16:00", startTime: "14:00", endTime: "16:00" },
  { slotNumber: 3, label: "Slot 3 — 16:15 to 18:15", startTime: "16:15", endTime: "18:15" },
] as const;

export function slotPresetsFor(slotNumber: 1 | 2 | 3) {
  return SESSION_SLOT_PRESETS.filter((p) => p.slotNumber === slotNumber);
}
