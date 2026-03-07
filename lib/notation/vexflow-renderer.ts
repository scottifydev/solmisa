import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  Accidental,
  Dot,
  Beam,
  Annotation,
  type StaveNoteStruct,
} from "vexflow";
import type { NotationData, NoteEvent } from "./types";

const IVORY = "#F5F0EB";
const STAFF_LINE_COLOR = IVORY;
const NOTE_COLOR = IVORY;

export interface RenderOptions {
  width?: number;
  height?: number;
  staffY?: number;
  staffWidth?: number;
  paddingLeft?: number;
  showClef?: boolean;
  showKeySignature?: boolean;
  showTimeSignature?: boolean;
  degreeColors?: Record<number, string>;
  highlightDegrees?: boolean;
}

export interface RenderedNote {
  note: StaveNote;
  event: NoteEvent;
}

export interface RenderResult {
  svg: SVGSVGElement;
  renderedNotes: RenderedNote[];
  totalWidth: number;
  totalHeight: number;
}

const DURATION_MAP: Record<string, string> = {
  w: "w",
  h: "h",
  q: "q",
  "8": "8",
  "16": "16",
  "32": "32",
};

function toVexDuration(duration: string, rest?: boolean): string {
  const base = DURATION_MAP[duration] ?? duration;
  return rest ? `${base}r` : base;
}

export function renderNotation(
  container: HTMLDivElement,
  data: NotationData,
  options: RenderOptions = {},
): RenderResult {
  const {
    staffY = 40,
    paddingLeft = 10,
    showClef = true,
    showKeySignature = true,
    showTimeSignature = true,
    degreeColors,
    highlightDegrees = false,
  } = options;

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  const estimatedWidth = options.width ?? estimateWidth(data, options);
  const height = options.height ?? 150;
  renderer.resize(estimatedWidth, height);

  const context = renderer.getContext();
  context.setFillStyle(NOTE_COLOR);
  context.setStrokeStyle(STAFF_LINE_COLOR);

  const staffWidth = options.staffWidth ?? estimatedWidth - paddingLeft * 2;
  const stave = new Stave(paddingLeft, staffY, staffWidth);

  if (showClef) stave.addClef(data.clef);
  if (showKeySignature) stave.addKeySignature(data.key);
  if (showTimeSignature && data.time) stave.addTimeSignature(data.time);

  stave.setStyle({
    fillStyle: STAFF_LINE_COLOR,
    strokeStyle: STAFF_LINE_COLOR,
  });
  stave.setContext(context);
  stave.draw();

  const renderedNotes: RenderedNote[] = [];
  const allVexNotes: StaveNote[] = [];
  let noteIndex = 0;

  for (let mIdx = 0; mIdx < data.measures.length; mIdx++) {
    const measure = data.measures[mIdx]!;
    for (const noteData of measure.notes) {
      const dur = toVexDuration(noteData.duration, noteData.rest);
      const noteStruct: StaveNoteStruct = {
        keys: noteData.rest ? ["b/4"] : noteData.keys,
        duration: dur,
        clef: data.clef,
        autoStem: true,
      };

      const vexNote = new StaveNote(noteStruct);

      if (noteData.dotted) {
        Dot.buildAndAttach([vexNote], { all: true });
      }

      if (noteData.accidental && !noteData.rest) {
        for (let i = 0; i < noteData.keys.length; i++) {
          vexNote.addModifier(new Accidental(noteData.accidental), i);
        }
      }

      const noteStyle = { fillStyle: NOTE_COLOR, strokeStyle: NOTE_COLOR };

      if (highlightDegrees && degreeColors && noteData.annotations?.degree) {
        const color = degreeColors[noteData.annotations.degree];
        if (color) {
          noteStyle.fillStyle = color;
          noteStyle.strokeStyle = color;
        }
      }

      vexNote.setStyle(noteStyle);

      if (noteData.annotations?.solfege) {
        const annotation = new Annotation(noteData.annotations.solfege);
        annotation.setVerticalJustification(Annotation.VerticalJustify.BOTTOM);
        annotation.setFont("DM Sans", 10);
        annotation.setStyle({ fillStyle: NOTE_COLOR });
        vexNote.addModifier(annotation);
      }

      const event: NoteEvent = {
        keys: noteData.keys,
        duration: noteData.duration,
        index: noteIndex,
        measureIndex: mIdx,
        degree: noteData.annotations?.degree,
        solfege: noteData.annotations?.solfege,
      };

      renderedNotes.push({ note: vexNote, event });
      allVexNotes.push(vexNote);
      noteIndex++;
    }
  }

  if (allVexNotes.length > 0) {
    const voice = new Voice({ numBeats: 4, beatValue: 4 });
    voice.setMode(Voice.Mode.SOFT);
    voice.addTickables(allVexNotes);

    const beams = Beam.generateBeams(allVexNotes);

    new Formatter()
      .joinVoices([voice])
      .format([voice], staffWidth - stave.getModifierXShift() - 20);

    voice.draw(context, stave);
    beams.forEach((b) => {
      b.setContext(context);
      b.draw();
    });
  }

  const svg = container.querySelector("svg") as SVGSVGElement;

  return {
    svg,
    renderedNotes,
    totalWidth: estimatedWidth,
    totalHeight: height,
  };
}

function estimateWidth(data: NotationData, options: RenderOptions): number {
  let noteCount = 0;
  for (const m of data.measures) {
    noteCount += m.notes.length;
  }
  const baseWidth = noteCount * 50 + 100;
  const clefWidth = options.showClef !== false ? 40 : 0;
  const keyWidth = options.showKeySignature !== false ? 30 : 0;
  const timeWidth = options.showTimeSignature !== false && data.time ? 30 : 0;
  return Math.max(200, baseWidth + clefWidth + keyWidth + timeWidth);
}

export function renderKeySignature(
  container: HTMLDivElement,
  keySignature: string,
  clef: "treble" | "bass" = "treble",
): RenderResult {
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  const width = 200;
  const height = 80;
  renderer.resize(width, height);

  const context = renderer.getContext();
  context.setFillStyle(NOTE_COLOR);
  context.setStrokeStyle(STAFF_LINE_COLOR);

  const stave = new Stave(10, 0, 170);
  stave.addClef(clef);
  stave.addKeySignature(keySignature);
  stave.setStyle({
    fillStyle: STAFF_LINE_COLOR,
    strokeStyle: STAFF_LINE_COLOR,
  });
  stave.setContext(context);
  stave.draw();

  const svg = container.querySelector("svg") as SVGSVGElement;

  return {
    svg,
    renderedNotes: [],
    totalWidth: width,
    totalHeight: height,
  };
}

export function renderScale(
  container: HTMLDivElement,
  scaleNotes: NotationData,
  highlightDegree?: number,
  degreeColors?: Record<number, string>,
): RenderResult {
  return renderNotation(container, scaleNotes, {
    showTimeSignature: false,
    highlightDegrees: highlightDegree != null,
    degreeColors,
  });
}
