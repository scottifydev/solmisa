"use client";

import type { FlowStreamCard } from "@/lib/chains/types";
import { brand } from "@/lib/tokens";
import { OptionGrid } from "./modalities/option-grid";
import { StaffToName } from "./modalities/staff-to-name";
import { ModalAlteration } from "./modalities/modal-alteration";
import { BinaryChoice } from "./modalities/binary-choice";
import { AccidentalInput } from "./modalities/accidental-input";
import { PartialFill } from "./modalities/partial-fill";
import { DragRank } from "./modalities/drag-rank";
import { StaffAccidentalInput } from "./modalities/staff-accidental-input";
import { AudioToName } from "./modalities/audio-to-name";
import { AudioSelect } from "./modalities/audio-select";
import { StaffNoteDisplay } from "./modalities/staff-note-display";
import { StaffMultiNote } from "./modalities/staff-multi-note";
import { StaffIntervalDisplay } from "./modalities/staff-interval-display";
import { StaffChordDisplay } from "./modalities/staff-chord-display";
import { FeelingStateMatch } from "./modalities/feeling-state-match";
import { KeySignatureDisplay } from "@/components/notation/key-signature-display";
import type { AudioConfig, AudioMode } from "@/lib/audio/audio-config-types";

interface FlowCardProps {
  card: FlowStreamCard;
  onAnswer: (correct: boolean) => void;
}

export function FlowCard({ card, onAnswer }: FlowCardProps) {
  const { modality, promptRendered, answerData, optionsData, parameters } =
    card;

  // Build options list from optionsData
  const options: { id: string; label: string }[] = (optionsData ?? []).map(
    (o) => ({
      id: (o.id as string) ?? "",
      label: (o.label as string) ?? "",
    }),
  );

  const correctAnswer = (answerData.correct_answer as string) ?? "";

  switch (modality) {
    case "staff_to_name":
      return (
        <StaffToName
          keySignature={card.chainRootKey}
          options={options}
          correctAnswer={correctAnswer}
          onAnswer={onAnswer}
        />
      );

    case "modal_alteration":
      return (
        <ModalAlteration
          root={(parameters.root as string) ?? "C"}
          scaleType={(parameters.scale_type as string) ?? "major"}
          highlightDegree={parameters.highlight_degree as number | undefined}
          options={options}
          correctAnswer={correctAnswer}
          onAnswer={onAnswer}
        />
      );

    case "binary_choice": {
      const optA = options[0] ?? { id: "a", label: "Option A" };
      const optB = options[1] ?? { id: "b", label: "Option B" };
      return (
        <BinaryChoice
          prompt={promptRendered}
          optionA={optA}
          optionB={optB}
          correctAnswer={correctAnswer}
          onAnswer={onAnswer}
        />
      );
    }

    case "name_to_sharps":
    case "name_to_flats":
      return (
        <AccidentalInput
          prompt={promptRendered}
          expectedAccidentals={
            (answerData.expected_accidentals as string[]) ?? []
          }
          ordered={(answerData.ordered as boolean) ?? true}
          onAnswer={onAnswer}
        />
      );

    case "partial_fill":
      return (
        <PartialFill
          sequence={(answerData.sequence as (string | null)[]) ?? []}
          options={(answerData.fill_options as string[]) ?? []}
          onAnswer={onAnswer}
        />
      );

    case "brightness_rank":
    case "drag_rank":
      return (
        <DragRank
          prompt={promptRendered}
          items={options.map((o) => ({ id: o.id, label: o.label }))}
          correctOrder={(answerData.correct_order as string[]) ?? []}
          onAnswer={onAnswer}
        />
      );

    case "staff_accidental":
      return (
        <StaffAccidentalInput
          clef={(parameters.clef as "treble" | "bass") ?? "treble"}
          accidentalType={
            (parameters.accidental_type as "sharp" | "flat") ?? "sharp"
          }
          expectedPositions={(answerData.expected_positions as string[]) ?? []}
          onAnswer={onAnswer}
        />
      );

    case "audio_to_name":
      return (
        <AudioSelect
          audioConfig={{
            mode: "scale_bare" as AudioMode,
            root: (parameters.root as string) ?? "C4",
            scaleType: parameters.scale_type as string | undefined,
            direction: parameters.direction as
              | "ascending"
              | "descending"
              | "both"
              | undefined,
            tempo: parameters.tempo as number | undefined,
          }}
          options={options}
          correctAnswer={correctAnswer}
          prompt={promptRendered}
          onAnswer={onAnswer}
        />
      );

    case "audio_select":
      return (
        <AudioSelect
          audioConfig={
            (parameters.audio_config as AudioConfig) ?? {
              mode: "scale_bare" as AudioMode,
              root: (parameters.root as string) ?? "C4",
              scaleType: parameters.scale_type as string | undefined,
            }
          }
          options={options}
          correctAnswer={correctAnswer}
          prompt={promptRendered}
          onAnswer={onAnswer}
        />
      );

    case "staff_note_display":
      return (
        <StaffNoteDisplay
          clef={(parameters.clef as "treble" | "bass") ?? "treble"}
          note={(parameters.note as string) ?? "C4"}
          showAccidental={parameters.show_accidental as boolean | undefined}
          options={options}
          correctAnswer={correctAnswer}
          onAnswer={onAnswer}
        />
      );

    case "staff_multi_note":
      return (
        <StaffMultiNote
          clef={(parameters.clef as "treble" | "bass") ?? "treble"}
          notes={(parameters.notes as string[]) ?? ["C4"]}
          options={options}
          correctAnswer={correctAnswer}
          onAnswer={onAnswer}
        />
      );

    case "staff_interval_display":
      return (
        <StaffIntervalDisplay
          clef={(parameters.clef as "treble" | "bass") ?? "treble"}
          notes={(parameters.notes as [string, string]) ?? ["C4", "G4"]}
          layout={(parameters.layout as "harmonic" | "melodic") ?? "melodic"}
          options={options}
          correctAnswer={correctAnswer}
          onAnswer={onAnswer}
        />
      );

    case "staff_chord_display":
      return (
        <StaffChordDisplay
          clef={(parameters.clef as "treble" | "bass" | "grand") ?? "treble"}
          notes={(parameters.notes as string[]) ?? ["C4", "E4", "G4"]}
          showFiguredBass={parameters.figured_bass as string | undefined}
          options={options}
          correctAnswer={correctAnswer}
          onAnswer={onAnswer}
        />
      );

    case "feeling_state_match":
      return (
        <FeelingStateMatch
          audioConfig={
            (parameters.audio_config as AudioConfig) ?? {
              mode: "scale_bare" as AudioMode,
              root: (parameters.root as string) ?? "C4",
              scaleType: parameters.scale_type as string | undefined,
            }
          }
          options={options.map((o) => ({
            ...o,
            tint: (
              (optionsData ?? []).find((od) => (od.id as string) === o.id) as
                | Record<string, unknown>
                | undefined
            )?.tint as string | undefined,
          }))}
          correctAnswer={correctAnswer}
          onAnswer={onAnswer}
        />
      );

    case "select_one":
    default: {
      return (
        <div className="flex flex-col items-center gap-4">
          {card.chainRootKey && (
            <div className="w-full max-w-[200px]">
              <KeySignatureDisplay keySignature={card.chainRootKey} />
            </div>
          )}
          <OptionGrid
            prompt={promptRendered}
            options={options}
            correctAnswer={correctAnswer}
            onAnswer={onAnswer}
          />
        </div>
      );
    }
  }
}
