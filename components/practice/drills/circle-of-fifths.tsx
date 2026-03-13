"use client";

import { CircleFifthsWidget } from "../inputs/circle-fifths-widget";

interface CircleOfFifthsProps {
  onAnswer: (correct: boolean) => void;
}

export function CircleOfFifths({ onAnswer }: CircleOfFifthsProps) {
  return <CircleFifthsWidget onAnswer={onAnswer} />;
}
