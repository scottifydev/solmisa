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
import { RhythmDisplay } from "./modalities/rhythm-display";
import { AudioRhythm } from "./modalities/audio-rhythm";
import { RhythmTapInput } from "./modalities/rhythm-tap-input";
import { TwoPartSelect } from "./modalities/two-part-select";
import { MultiStepSelect } from "./modalities/multi-step-select";
import { MultiSelect } from "./modalities/multi-select";
import { TimedSelect } from "./modalities/timed-select";
import { StaffAudioSelect } from "./modalities/staff-audio-select";
import { StaffPlacement } from "./modalities/staff-placement";
import { ScaleSculptor } from "./modalities/scale-sculptor";
import { SequenceBuilder } from "./modalities/sequence-builder";
import { PianoKeyboardInput } from "./modalities/piano-keyboard-input";
import { KeySignatureDisplay } from "@/components/notation/key-signature-display";
import type { AudioConfig, AudioMode } from "@/lib/audio/audio-config-types";
import type { NotationData } from "@/lib/notation/types";

const DB_TYPE_TO_MODE: Record<string, AudioMode> = {
  scale: "scale_bare",
  scale_bare: "scale_bare",
  scale_with_vamp: "scale_with_vamp",
  drone_and_note: "degree_with_drone",
  drone_and_two_notes: "degree_with_drone",
  cadence: "progression_block",
  chord: "chord_arpeggiated",
  chord_arpeggiated: "chord_arpeggiated",
  chord_blocked: "chord_blocked",
  interval: "interval_melodic",
  interval_melodic: "interval_melodic",
  interval_harmonic: "interval_harmonic",
  degree_with_drone: "degree_with_drone",
  degree_with_vamp: "degree_with_vamp",
  degree_fading_drone: "degree_fading_drone",
  rhythm: "rhythm_percussion",
};

function normalizeAudioConfig(raw: Record<string, unknown>): AudioConfig {
  const mode =
    (raw.mode as AudioMode) ??
    DB_TYPE_TO_MODE[raw.type as string] ??
    ("scale_bare" as AudioMode);
  return { ...raw, mode } as unknown as AudioConfig;
}

interface FlowCardProps {
  card: FlowStreamCard;
  onAnswer: (correct: boolean) => void;
  missCount?: number;
  isBreakthrough?: boolean;
  wasRecovery?: boolean;
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

    case "staff_placement":
      return (
        <StaffPlacement
          clef={
            (parameters.clef as "treble" | "bass" | "alto" | "tenor") ??
            "treble"
          }
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
          srsStage={card.srsStage}
        />
      );

    case "audio_select":
      return (
        <AudioSelect
          audioConfig={
            parameters.audio_config
              ? normalizeAudioConfig(
                  parameters.audio_config as Record<string, unknown>,
                )
              : {
                  mode: "scale_bare" as AudioMode,
                  root: (parameters.root as string) ?? "C4",
                  scaleType: parameters.scale_type as string | undefined,
                }
          }
          options={options}
          correctAnswer={correctAnswer}
          prompt={promptRendered}
          onAnswer={onAnswer}
          srsStage={card.srsStage}
        />
      );

    case "piano_keyboard":
      return (
        <PianoKeyboardInput
          clef={(parameters.clef as "treble" | "bass") ?? "treble"}
          note={(parameters.note as string) ?? "C4"}
          showAccidental={parameters.show_accidental as boolean | undefined}
          correctAnswer={correctAnswer}
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
            parameters.audio_config
              ? normalizeAudioConfig(
                  parameters.audio_config as Record<string, unknown>,
                )
              : {
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

    case "rhythm_display":
      return (
        <RhythmDisplay
          timeSignature={(parameters.time_signature as string) ?? "4/4"}
          notes={
            (parameters.rhythm_notes as {
              value: string;
              dot?: boolean;
              rest?: boolean;
            }[]) ?? []
          }
          options={options}
          correctAnswer={correctAnswer}
          onAnswer={onAnswer}
        />
      );

    case "audio_rhythm":
      return (
        <AudioRhythm
          audioConfig={
            parameters.audio_config
              ? normalizeAudioConfig(
                  parameters.audio_config as Record<string, unknown>,
                )
              : {
                  mode: "rhythm_percussion" as AudioMode,
                  tempo: (parameters.tempo as number) ?? 100,
                }
          }
          timeSignature={(parameters.time_signature as string) ?? "4/4"}
          rhythmOptions={
            (parameters.rhythm_options as {
              id: string;
              label: string;
              notes: { value: string; dot?: boolean; rest?: boolean }[];
            }[]) ?? []
          }
          correctAnswer={correctAnswer}
          onAnswer={onAnswer}
        />
      );

    case "rhythm_tap":
      return (
        <RhythmTapInput
          timeSignature={(parameters.time_signature as string) ?? "4/4"}
          notes={
            (parameters.rhythm_notes as {
              value: string;
              dot?: boolean;
              rest?: boolean;
            }[]) ?? []
          }
          expectedBeats={(parameters.expected_beats as number[]) ?? []}
          tempo={(parameters.tempo as number) ?? 100}
          toleranceMs={parameters.tolerance_ms as number | undefined}
          onAnswer={onAnswer}
        />
      );

    case "two_part_select":
      return (
        <TwoPartSelect
          part1={{
            prompt: (answerData.part1_prompt as string) ?? "",
            options:
              (answerData.part1_options as { id: string; label: string }[]) ??
              [],
            correctAnswer: (answerData.part1_correct as string) ?? "",
          }}
          part2={{
            prompt: (answerData.part2_prompt as string) ?? "",
            options:
              (answerData.part2_options as { id: string; label: string }[]) ??
              [],
            correctAnswer: (answerData.part2_correct as string) ?? "",
          }}
          onAnswer={onAnswer}
        />
      );

    case "multi_step_select":
      return (
        <MultiStepSelect
          items={(parameters.items as string[]) ?? []}
          options={options}
          correctLabels={(answerData.correct_labels as string[]) ?? []}
          onAnswer={onAnswer}
        />
      );

    case "multi_select":
      return (
        <MultiSelect
          prompt={promptRendered}
          options={options}
          correctAnswers={(answerData.correct_answers as string[]) ?? []}
          minSelections={answerData.min_selections as number | undefined}
          maxSelections={answerData.max_selections as number | undefined}
          onAnswer={onAnswer}
        />
      );

    case "timed_select":
      return (
        <TimedSelect
          prompt={promptRendered}
          options={options}
          correctAnswer={correctAnswer}
          speedThresholdMs={parameters.speed_threshold_ms as number | undefined}
          onAnswer={onAnswer}
        />
      );

    case "staff_audio_select":
      return (
        <StaffAudioSelect
          notationData={
            (parameters.notation_data as NotationData) ?? {
              clef: "treble",
              key: "C",
              measures: [],
            }
          }
          audioConfig={
            parameters.audio_config
              ? normalizeAudioConfig(
                  parameters.audio_config as Record<string, unknown>,
                )
              : {
                  mode: "scale_bare" as AudioMode,
                  root: (parameters.root as string) ?? "C4",
                }
          }
          options={options}
          correctAnswer={correctAnswer}
          prompt={promptRendered}
          onAnswer={onAnswer}
        />
      );

    case "scale_sculptor":
      return (
        <ScaleSculptor
          root={(parameters.root as string) ?? "C4"}
          startMode={(parameters.start_mode as string) ?? "ionian"}
          targetMode={(parameters.target_mode as string) ?? "dorian"}
          prompt={promptRendered}
          hintDegrees={parameters.hint_degrees as number[] | undefined}
          onAnswer={onAnswer}
        />
      );

    case "sequence_builder":
      return (
        <SequenceBuilder
          accidentalType={
            (parameters.accidental_type as "sharps" | "flats") ?? "sharps"
          }
          correctCount={(answerData.correct_count as number) ?? 0}
          revealedCount={answerData.revealed_count as number | undefined}
          prompt={promptRendered}
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
