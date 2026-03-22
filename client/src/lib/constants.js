import { Goal, Shield, Swords, Zap } from "lucide-react";

export const levelWeights = {
  Beginner: 1,
  Intermediate: 2,
  Pro: 3,
};

export const positions = [
  { value: "Striker", icon: Swords },
  { value: "Midfielder", icon: Zap },
  { value: "Defender", icon: Shield },
  { value: "GK", icon: Goal },
];

export const levels = Object.keys(levelWeights);
