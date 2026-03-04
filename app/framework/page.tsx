import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pedagogical Framework | solmisa",
  description: "The research foundation behind solmisa: Gordon's Music Learning Theory, functional ear training, and FSRS spaced repetition.",
};

export default function FrameworkPage() {
  return (
    <div className="min-h-screen bg-night">
      {/* Header */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-steel">
        <Link href="/">
          <Logo size={28} withWordmark wordmarkSize={18} />
        </Link>
        <Link
          href="/signup"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-coral text-white text-sm font-body font-medium hover:bg-coral/90 transition-colors"
        >
          Sign up free
        </Link>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ivory">
            Pedagogical Framework
          </h1>
          <p className="text-silver mt-2 text-lg">A research foundation for solmisa</p>
        </div>

        {/* TL;DR */}
        <div className="rounded-xl border border-coral/20 bg-coral/5 p-6 space-y-3">
          <h2 className="font-display text-lg font-bold text-ivory">TL;DR</h2>
          <p className="text-silver leading-relaxed">
            solmisa sits at the intersection of three proven but rarely combined ideas: Edwin Gordon&apos;s audiation-based learning sequence, functional ear training pedagogy, and FSRS-powered spaced repetition. No existing app occupies this niche. Every concept is heard in tonal context before receiving a name, and every name is learned before notation appears. SRS is adapted for music with session-based scheduling, context variation, and progressive response modes.
          </p>
        </div>

        {/* Section 1 */}
        <Section title="1. Gordon&apos;s Music Learning Theory: audiation as cognitive foundation">
          <H3>What audiation actually means</H3>
          <P>
            Gordon coined &ldquo;audiation&rdquo; in 1975 to describe the ability to hear and comprehend music in the mind when sound is not physically present. His defining analogy: &ldquo;Audiation is to music what thought is to language.&rdquo; Unlike imitation (reproducing sound without understanding), inner hearing (vaguely imagining music), or aural perception (receiving sound through the ears in real time), audiation is a cognitive process of organizing sounds into tonal patterns and rhythm patterns, assigning them meaning based on prior musical experience.
          </P>
          <P>
            Gordon identified 8 non-hierarchical types of audiation (listening, reading, writing from dictation, recalling from memory, recalling and writing, improvising while performing, improvising while reading, improvising while writing) and 6 hierarchical stages through which audiation deepens: momentary retention, pattern recognition and tonic/beat finding, establishing tonality and meter, retaining organized patterns, recalling patterns from other music, and anticipating and predicting what comes next. The sixth stage &mdash; prediction &mdash; is what distinguishes fluent musicians from beginners.
          </P>

          <H3>The skill learning sequence</H3>
          <P>
            Gordon&apos;s pedagogical engine is the Skill Learning Sequence, divided into Discrimination Learning (teacher-guided, rote-based) and Inference Learning (student-directed, applied to novel material).
          </P>
          <P>
            Discrimination Learning progresses through five levels. Aural/Oral comes first: students echo tonal and rhythm patterns on neutral syllables, building a sound vocabulary without any labels. Verbal Association adds solf&egrave;ge &mdash; movable-do with la-based minor for tonal patterns, beat-function syllables for rhythm. This is the &ldquo;workhorse&rdquo; level; without labels, students can retain roughly 10 patterns, but with solf&egrave;ge the vocabulary expands dramatically. Partial Synthesis teaches students to recognize patterns in musical context. Symbolic Association introduces notation for the first time. Composite Synthesis integrates reading with contextual understanding.
          </P>
          <P>
            Inference Learning follows: Generalization (applying known patterns to unfamiliar material), Creativity/Improvisation (producing original music), and finally Theoretical Understanding &mdash; traditional music theory is the last step, built atop audiation fluency.
          </P>

          <H3>Tonal and rhythm content sequences</H3>
          <P>
            Gordon insisted on teaching major and harmonic minor concurrently from the start, not major-first-then-minor. Tonal patterns are organized by harmonic function (tonic, dominant, subdominant) within each tonality, and are sung without rhythmic context. Rhythm patterns are similarly organized by meter (duple and triple taught concurrently) and rhythmic function, chanted without pitch. This separation reduces cognitive load, though critics challenge its artificiality.
          </P>

          <H3>Adapting MLT for adult self-learners</H3>
          <P>
            Musical aptitude stabilizes around age 9, so adults have fixed aptitude ceilings but can still dramatically increase achievement. Adults who had prior notation-first training often carry deeply ingrained decoding habits that interfere with developing audiation. The consensus among practitioners: the sequence is universal, but pacing must be compressed for adults, who bring cognitive maturity, metacognitive awareness, and extensive passive listening vocabularies.
          </P>
          <P>
            The critical gap: no dedicated MLT-based app exists. No tool systematically guides users through the skill learning sequence with interactive pattern work, solf&egrave;ge labeling, and adaptive progression. This is the opportunity solmisa addresses.
          </P>

          <H3>Design implications</H3>
          <P>
            solmisa uses Gordon&apos;s sequence as a structural spine without treating it as dogma. The aural/oral phase is compressed for adults (weeks, not months). Theory explanations appear earlier than Gordon would prescribe &mdash; adults benefit from knowing &ldquo;why.&rdquo; Tonal and rhythmic content integrate sooner than pure MLT prescribes. The Western tonal focus is acknowledged transparently.
          </P>
        </Section>

        {/* Section 2 */}
        <Section title="2. The audiation-first debate: where adults fit">
          <H3>Sound-before-symbol is a lineage, not one method</H3>
          <P>
            Four major pedagogical traditions share the principle that aural experience precedes symbolic learning: Kod&aacute;ly (singing-centered, moves to notation relatively quickly), Suzuki (delays notation the longest, relying on immersion), Dalcroze (embodied, kinesthetic learning through movement), and Gordon (delays notation until after audiation is established, using pattern-based vocabulary building).
          </P>
          <P>
            The traditional theory-first approach &mdash; dominant in Western conservatories since the 19th century &mdash; starts with notation, scales on paper, and interval identification before ear training. Critics counter that it creates &ldquo;button pushers&rdquo; who manipulate symbols without hearing what they represent.
          </P>

          <H3>What research says about adults</H3>
          <P>
            Timothy Chenette&apos;s influential 2021 article in Music Theory Online distinguishes between &ldquo;truly aural&rdquo; perceptual skills (hearing bass lines, recognizing patterns) and knowledge-mediated skills (Roman numeral dictation). Working memory capacity is fixed by adulthood, so the focus should be on making memory use more efficient through chunking and pattern recognition &mdash; which directly supports Gordon&apos;s pattern-based approach.
          </P>
          <P>
            Adults can develop aural and theoretical skills simultaneously, unlike children who need strict aural-first sequencing. The question isn&apos;t either/or &mdash; it&apos;s which track leads slightly.
          </P>

          <H3>The parallel-tracks model</H3>
          <P>
            solmisa uses a dual-track approach where sound slightly leads and theory scaffolds. Every new concept opens with a listening/recognition exercise before showing notation or terminology. But the gap is short &mdash; adults want to understand the &ldquo;why&rdquo; promptly. The aural track and theory track run in parallel with regular intersection points.
          </P>
        </Section>

        {/* Section 3 */}
        <Section title="3. Functional ear training: hearing music as musicians do">
          <H3>Why functional beats intervallic</H3>
          <P>
            The case against isolated interval identification as primary ear training is overwhelming. Gary Karpinski writes: &ldquo;Despite the overwhelming experimental evidence that there is little connection between the ability to identify intervals acontextually and the ability to do so in a tonal context, such teaching methods nevertheless persist.&rdquo; A perfect 5th from scale degree 1&rarr;5 sounds fundamentally different from 2&rarr;6 or 4&rarr;1. Intervals have no fixed &ldquo;character&rdquo; &mdash; scale degrees do.
          </P>
          <P>
            Functional training teaches learners to recognize that a note is the dominant, the leading tone, or the subdominant within a key, without calculating distances. Cognitive research confirms that listeners &mdash; even nonmusicians &mdash; automatically attempt to find a tonal center when hearing music. Functional training aligns with this natural perceptual process.
          </P>

          <H3>Alain Benbassat&apos;s method</H3>
          <P>
            The Functional Ear Trainer provides the clearest operational blueprint. A I-IV-V-I cadence establishes the key. A single note plays. The learner identifies its scale degree. The note then resolves stepwise to tonic, reinforcing each degree&apos;s positional &ldquo;gravity.&rdquo;
          </P>
          <P>
            Benbassat&apos;s progression builds outward from stability: tonic (1) alone, then add 5, then 3 (completing the tonic triad), then 4 and 2, then 6 and 7 for the full diatonic scale, then minor and chromatic degrees. This converges with the Kod&aacute;ly tradition&apos;s ordering.
          </P>

          <H3>Solf&egrave;ge system</H3>
          <P>
            For a self-study app targeting adults, movable-do solf&egrave;ge is the clear winner. Each syllable maps consistently to a scale function regardless of key. The solf&egrave;ge vowels encode tendency: Do and Sol use the grounding &ldquo;oh&rdquo; vowel; Mi and Ti use the bright &ldquo;ee&rdquo; pointing upward; Fa and La use the tall &ldquo;ah&rdquo; pointing downward.
          </P>
        </Section>

        {/* Section 4 */}
        <Section title="4. Spaced repetition meets music: what FSRS can and cannot do">
          <H3>The spacing effect and music</H3>
          <P>
            For declarative knowledge (key signatures, interval names, chord symbols), SRS is well-supported with a robust d=0.42 effect size across 116 studies. For perceptual/auditory skills, the evidence is thinner but promising. Spacing effects have been demonstrated for non-semantic stimuli including unfamiliar faces and nonsense shapes, suggesting the mechanism works for perceptual learning via reduced repetition priming.
          </P>
          <P>
            However, no published RCTs specifically test SRS for auditory recognition over days-to-months timescales. Auditory skills may need shorter initial review intervals than verbal facts. And a minimum number of trials per session is required for perceptual learning to occur &mdash; below this threshold, no learning happens regardless of spacing.
          </P>

          <H3>FSRS: the algorithmic engine</H3>
          <P>
            The Free Spaced Repetition Scheduler models memory with three variables: Stability (days until recall drops to target probability), Difficulty (intrinsic card difficulty), and Retrievability (current recall probability). It uses 21 parameters optimized per-user via machine learning, achieving 99.6% superiority over SM-2 in benchmarks with roughly 20&ndash;30% fewer reviews for the same retention rate.
          </P>

          <H3>Music-specific SRS adaptations</H3>
          <P>
            Standard card-based SRS doesn&apos;t map cleanly onto music. solmisa makes five adaptations: session-based scheduling (multiple trials per review, not single flashcards), hybrid massed-spaced within sessions, context variation across reviews (different keys, timbres, registers), progressive response modes (recognition at early stages, production at advanced stages), and separate FSRS parameters by skill type (factual vs. perceptual).
          </P>
        </Section>

        {/* Section 5 */}
        <Section title="5. What the major curricula agree on">
          <P>
            Analysis of five major curricula (Berklee Online, musictheory.net, Open Music Theory v2, Laitz, and Aldwell &amp; Schachter) reveals strong convergence on fundamentals sequencing:
          </P>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-steel">
                  <th className="text-left text-ivory font-display font-bold p-3">Principle</th>
                  <th className="text-left text-ivory font-display font-bold p-3">Agreement</th>
                  <th className="text-left text-ivory font-display font-bold p-3">solmisa Application</th>
                </tr>
              </thead>
              <tbody className="text-silver">
                <tr className="border-b border-steel/50">
                  <td className="p-3">Scales before intervals</td>
                  <td className="p-3">All 5 curricula + cognitive research</td>
                  <td className="p-3">Scale degree recognition first, then interval naming</td>
                </tr>
                <tr className="border-b border-steel/50">
                  <td className="p-3">Major and minor concurrently</td>
                  <td className="p-3">Gordon + Kod&aacute;ly</td>
                  <td className="p-3">Introduce minor within Module 2</td>
                </tr>
                <tr className="border-b border-steel/50">
                  <td className="p-3">Rhythm as early parallel track</td>
                  <td className="p-3">Berklee, musictheory.net, OMT</td>
                  <td className="p-3">Rhythm exercises from Module 1</td>
                </tr>
                <tr className="border-b border-steel/50">
                  <td className="p-3">Modes as modifications, not rotations</td>
                  <td className="p-3">Jazz pedagogy</td>
                  <td className="p-3">Module 5, taught via parallel approach</td>
                </tr>
                <tr className="border-b border-steel/50">
                  <td className="p-3">Circle of fifths with key signatures</td>
                  <td className="p-3">Universal</td>
                  <td className="p-3">Embedded in scales/keys module</td>
                </tr>
                <tr className="border-b border-steel/50">
                  <td className="p-3">Roman numerals after chord ID</td>
                  <td className="p-3">All curricula</td>
                  <td className="p-3">Same module as diatonic chords</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* Section 6 */}
        <Section title="6. How existing apps fail &mdash; and what solmisa does differently">
          <P>
            Six recurring failures across music theory apps:
          </P>
          <ol className="list-decimal list-inside space-y-3 text-silver leading-relaxed">
            <li><strong className="text-ivory">Isolated interval identification as primary ear training.</strong> Karpinski&apos;s research shows little connection between acontextual interval identification and tonal-context ability. solmisa centers functional, context-embedded ear training from day one.</li>
            <li><strong className="text-ivory">Teaching modes as &ldquo;starting on a different note.&rdquo;</strong> The derivative approach teaches calculation, not hearing. solmisa leads with sonic character and characteristic notes.</li>
            <li><strong className="text-ivory">Neglecting rhythm.</strong> Most apps focus solely on pitch. solmisa integrates rhythm as a parallel track from Module 1.</li>
            <li><strong className="text-ivory">Disconnection from real music.</strong> solmisa uses varied timbres, real excerpts, and exercises that transition from drills to song recognition.</li>
            <li><strong className="text-ivory">Testing without teaching.</strong> Each review includes brief explanations and the option to revisit teaching material.</li>
            <li><strong className="text-ivory">Gamification replacing musicality.</strong> solmisa uses structural gamification (mastery gates, progress tracking) without superficial reward mechanics. The music itself is the reward.</li>
          </ol>
        </Section>

        {/* Section 7 */}
        <Section title="7. The solmisa curriculum: module map">
          <P>
            Each module contains 3&ndash;5 lessons with both an aural/recognition track and a theory/symbolic track running in parallel. Modules follow dependency gating: core skills must reach Guru status (roughly 80% accuracy over 1-week review cycles) before the next module unlocks.
          </P>

          <div className="space-y-4">
            <ModuleCard
              number={1}
              title="Sound Foundations"
              description="Establish tonic awareness, basic pulse, and the listening-first habit."
              topics="Finding tonic, feeling steady pulse, tonic triad recognition, macro/microbeat awareness"
            />
            <ModuleCard
              number={2}
              title="The Major Scale and Its Degrees"
              description="Audiate all 7 major scale degrees with solf&egrave;ge; construct major scales."
              topics="Scale degrees 1-3-5, pentatonic (add 2, 6), tendency tones (4, 7), full diatonic, syncopation"
            />
            <ModuleCard
              number={3}
              title="Minor Tonality and Intervals"
              description="Audiate minor scale degrees; name and hear intervals in tonal context."
              topics="Minor tonic triad, characteristic tones, functional interval recognition, compound meter"
            />
            <ModuleCard
              number={4}
              title="Chords and Functional Harmony"
              description="Hear chord qualities and basic progressions; understand Roman numeral analysis."
              topics="Triad and seventh chord qualities, diatonic chords, bass motion, cadence types"
            />
            <ModuleCard
              number={5}
              title="Modes and Chromatic Hearing"
              description="Audiate modes as sonic colors; hear chromatic scale degrees."
              topics="Dorian, Mixolydian, Lydian, Phrygian, chromatic solf&egrave;ge, modal chord progressions"
            />
            <ModuleCard
              number={6}
              title="Phrase Structure and Real-Music Analysis"
              description="Hear how harmony, melody, and rhythm create musical form."
              topics="Phrase boundaries, non-chord tones, real-song analysis, melodic dictation"
            />
            <ModuleCard
              number={7}
              title="Applied Musicianship"
              description="Synthesize all skills into creative, generative musical fluency."
              topics="Transcription, improvisation foundations, multi-voice dictation, harmonic analysis"
            />
          </div>

          {/* Dependency chain */}
          <div className="rounded-xl border border-steel bg-charcoal p-6 mt-6">
            <h3 className="font-display text-base font-bold text-ivory mb-3">Module Prerequisites</h3>
            <div className="font-mono text-sm text-silver space-y-1">
              <p>Module 1 (Sound Foundations)</p>
              <p className="text-steel pl-4">&darr;</p>
              <p>Module 2 (Major Scale &amp; Degrees)</p>
              <p className="text-steel pl-4">&darr;</p>
              <p>Module 3 (Minor &amp; Intervals)</p>
              <p className="text-steel pl-4">&darr;</p>
              <p>Module 4 (Chords &amp; Functional Harmony)</p>
              <p className="text-steel pl-4">&darr;</p>
              <p>Module 5 (Modes &amp; Chromatic)</p>
              <p className="text-steel pl-4">&darr;</p>
              <p>Module 6 (Phrase Structure &amp; Real Music)</p>
              <p className="text-steel pl-4">&darr;</p>
              <p>Module 7 (Applied Musicianship)</p>
            </div>
          </div>
        </Section>

        {/* Section 8 */}
        <Section title="Three guiding principles">
          <div className="space-y-6">
            <div className="rounded-xl border border-steel bg-charcoal p-6">
              <h3 className="font-display text-base font-bold text-ivory mb-2">Function before label, always</h3>
              <p className="text-silver leading-relaxed">
                Every concept is first heard in tonal context before receiving a name, and first receives a name before being shown in notation. This is Gordon&apos;s sequence compressed for adult efficiency but never inverted.
              </p>
            </div>
            <div className="rounded-xl border border-steel bg-charcoal p-6">
              <h3 className="font-display text-base font-bold text-ivory mb-2">SRS adapted for music, not imported from language learning</h3>
              <p className="text-silver leading-relaxed">
                Perceptual ear training requires session-based scheduling (multiple trials per review), context variation across reviews (different keys, timbres, registers), and progressive response modes (recognition at early stages, production at advanced stages).
              </p>
            </div>
            <div className="rounded-xl border border-steel bg-charcoal p-6">
              <h3 className="font-display text-base font-bold text-ivory mb-2">Honest about what it is</h3>
              <p className="text-silver leading-relaxed">
                solmisa is a secondary reinforcement tool, not a teacher replacement. It excels at spaced review, pattern drilling, progressive skill building, and self-paced theory study. It cannot evaluate musicality or adapt to creative goals the way a human teacher can. This honest positioning &mdash; combined with functional ear training meets SRS &mdash; is its most defensible position.
              </p>
            </div>
          </div>
        </Section>

        {/* Bottom CTA */}
        <div className="border-t border-steel pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/"
            className="text-coral hover:text-coral/80 transition-colors font-body"
          >
            &larr; Try solmisa
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-coral text-white font-body font-medium hover:bg-coral/90 transition-colors"
          >
            Sign up free
          </Link>
        </div>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 pt-4">
      <h2 className="font-display text-2xl font-bold text-ivory">{title}</h2>
      {children}
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display text-lg font-bold text-ivory mt-6">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-silver leading-relaxed">{children}</p>;
}

function ModuleCard({ number, title, description, topics }: { number: number; title: string; description: string; topics: string }) {
  return (
    <div className="rounded-xl border border-steel bg-charcoal p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-coral/10 text-coral font-mono text-sm font-bold flex-shrink-0">
          {number}
        </span>
        <div>
          <h3 className="font-display text-base font-bold text-ivory">{title}</h3>
          <p className="text-silver text-sm mt-1">{description}</p>
          <p className="text-silver/70 text-xs mt-2">{topics}</p>
        </div>
      </div>
    </div>
  );
}
