import {
  Code2, Brain, GraduationCap, Building2, Rocket, Users, Award, BookOpen, Briefcase,
  Target, TrendingUp, Lightbulb, Handshake, Globe, Laptop, School, Trophy, Star,
  MessageSquare, CheckCircle2, Compass, Layers, Zap, Heart, Shield, Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const LUCIDE_CATALOG: { name: string; Icon: LucideIcon }[] = [
  { name: "Code2", Icon: Code2 },
  { name: "Brain", Icon: Brain },
  { name: "GraduationCap", Icon: GraduationCap },
  { name: "Building2", Icon: Building2 },
  { name: "Rocket", Icon: Rocket },
  { name: "Users", Icon: Users },
  { name: "Award", Icon: Award },
  { name: "BookOpen", Icon: BookOpen },
  { name: "Briefcase", Icon: Briefcase },
  { name: "Target", Icon: Target },
  { name: "TrendingUp", Icon: TrendingUp },
  { name: "Lightbulb", Icon: Lightbulb },
  { name: "Handshake", Icon: Handshake },
  { name: "Globe", Icon: Globe },
  { name: "Laptop", Icon: Laptop },
  { name: "School", Icon: School },
  { name: "Trophy", Icon: Trophy },
  { name: "Star", Icon: Star },
  { name: "MessageSquare", Icon: MessageSquare },
  { name: "CheckCircle2", Icon: CheckCircle2 },
  { name: "Compass", Icon: Compass },
  { name: "Layers", Icon: Layers },
  { name: "Zap", Icon: Zap },
  { name: "Heart", Icon: Heart },
  { name: "Shield", Icon: Shield },
  { name: "Clock", Icon: Clock },
];

export function getLucideIcon(name: string): LucideIcon | undefined {
  return LUCIDE_CATALOG.find((i) => i.name === name)?.Icon;
}
