import {
  Sigma,
  Orbit,
  Dna,
  FlaskConical,
  Boxes,
  Spline,
  Activity,
  Cog,
  CircleDot,
  Waves,
  GitFork,
  Wrench,
  Cpu,
  BarChart3,
  Atom,
  Hexagon,
  Grid3x3,
  Brain,
  LineChart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SceneInit, ParamValues } from "./three-scene";
import type { LabChartData } from "./lab-chart";
import {
  mathScene,
  mathReadouts,
  mathChart,
  lissajousScene,
  lissajousReadouts,
  lissajousChart,
  physicsScene,
  orbitReadouts,
  orbitChart,
  pendulumScene,
  pendulumReadouts,
  pendulumChart,
  scienceScene,
  dnaReadouts,
  gearScene,
  gearReadouts,
  gearChart,
  gearTrainScene,
  gearTrainReadouts,
  gearTrainChart,
  cradleScene,
  cradleReadouts,
  springScene,
  springReadouts,
  springChart,
  doublePendulumScene,
  doublePendulumReadouts,
  sortingScene,
  sortingReadouts,
  sortingChart,
  moleculeScene,
  moleculeReadouts,
  moleculeChart,
  matrixScene,
  matrixReadouts,
  matrixChart,
  neuronScene,
  neuronReadouts,
  neuronChart,
  calculusScene,
  calculusReadouts,
  calculusChart,
} from "./scenes";

/** A single interactive control rendered in the Parameters panel. */
export type LabControl =
  | {
      kind: "slider";
      key: string;
      label: string;
      min: number;
      max: number;
      step: number;
      default: number;
      unit?: string;
      /** A change forces a full scene rebuild (use for structural params). */
      rebuild?: boolean;
    }
  | { kind: "toggle"; key: string; label: string; default: boolean }
  | {
      kind: "select";
      key: string;
      label: string;
      options: { label: string; value: string }[];
      default: string;
      rebuild?: boolean;
    };

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

/** One explorable 3D model. Either a real `glb` file (served from /public/models)
 *  or a built-in procedural `init` scene. Each carries live `controls`, computed
 *  `readouts`, learning content, and a short lesson so the model doubles as a
 *  lesson you can drive. */
export interface LabModel {
  id: string;
  name: string;
  tagline: string;
  Icon: LucideIcon;
  glb?: string;
  init?: SceneInit;
  /** Live parameters surfaced in the Parameters panel. */
  controls?: LabControl[];
  /** Result cards computed from the current parameter values. */
  readouts?: (p: ParamValues) => { label: string; value: string }[];
  /** Live simulation-native graph computed from the current parameter values. */
  chart?: (p: ParamValues) => LabChartData;
  /** Bullets shown in the "Try interacting" hint card over the stage. */
  toolHints?: string[];
  /** Param key the Play/Pause button toggles (e.g. "animate"). */
  playKey?: string;
  /** Show the Wireframe tool for this model. */
  supportsWireframe?: boolean;
  /** Initial state of the Spin (auto-rotate) view tool. */
  autoRotateDefault?: boolean;
  /** Opt-in PBR environment lighting (realistic metals/glass). */
  environment?: boolean;
  mode: "Simulation" | "Real model";
  summary: string;
  lesson: string[];
  facts?: { label: string; value: string }[];
  credit?: string;
  // ── Learning Mode metadata (shown on cards + the Learn panel) ──
  difficulty?: Difficulty;
  estMinutes?: number;
  /** One-line learning objective. */
  objective?: string;
  /** Key concepts covered. */
  concepts?: string[];
  /** Real-world applications. */
  applications?: string[];
  /** Guided interactive tasks. */
  tasks?: string[];
  /** A single open-ended challenge prompt. */
  challenge?: string;
}

export interface LabSubject {
  slug: string;
  title: string;
  tagline: string;
  blurb: string;
  Icon: LucideIcon;
  models: LabModel[];
}

export const LAB_SUBJECTS: LabSubject[] = [
  {
    slug: "physics",
    title: "Physics",
    tagline: "Mechanics, motion & machines",
    blurb:
      "Mesh real gears, swing a Newton's cradle, stretch a spring, and unleash a chaotic double pendulum — every law of motion made tangible.",
    Icon: Orbit,
    models: [
      {
        id: "spur-gears",
        name: "Spur gear system",
        tagline: "Two meshing gears · live ratio",
        Icon: Cog,
        init: gearScene,
        mode: "Simulation",
        playKey: "animate",
        autoRotateDefault: false,
        environment: true,
        difficulty: "Beginner",
        estMinutes: 6,
        objective: "Understand how meshing gears trade speed for torque through their tooth ratio.",
        controls: [
          {
            kind: "slider",
            key: "teeth1",
            label: "Gear 1 teeth (driver)",
            min: 8,
            max: 40,
            step: 1,
            default: 20,
            rebuild: true,
          },
          {
            kind: "slider",
            key: "teeth2",
            label: "Gear 2 teeth (driven)",
            min: 8,
            max: 60,
            step: 1,
            default: 36,
            rebuild: true,
          },
          {
            kind: "slider",
            key: "rpm",
            label: "Drive speed (RPM)",
            min: 10,
            max: 180,
            step: 5,
            default: 60,
          },
          {
            kind: "select",
            key: "dir",
            label: "Direction",
            default: "cw",
            options: [
              { label: "Clockwise", value: "cw" },
              { label: "Counter-clockwise", value: "ccw" },
            ],
          },
          { kind: "toggle", key: "animate", label: "Run rotation", default: true },
        ],
        readouts: gearReadouts,
        chart: gearChart,
        toolHints: [
          "Drag to orbit the gears",
          "Change the tooth counts",
          "Watch the gear ratio update",
        ],
        summary:
          "Two machined spur gears meshing — the driver turns the driven gear at a speed set by their tooth ratio.",
        lesson: [
          "When two spur gears mesh, the smaller gear spins faster but with less torque, and the larger one spins slower with more torque. The exact trade is the gear ratio: the driven gear's teeth divided by the driver's teeth.",
          "Change the tooth counts and watch the output speed and torque update live. Meshing gears always turn in opposite directions — flip the direction control to confirm. This single principle powers everything from clocks to car gearboxes.",
        ],
        facts: [
          { label: "Ratio", value: "N₂ / N₁" },
          { label: "Direction", value: "reverses on mesh" },
          { label: "Trade-off", value: "speed ↔ torque" },
        ],
        concepts: [
          "Gear ratio = N₂ / N₁",
          "Speed vs torque trade-off",
          "Direction reversal on meshing",
          "Module & pitch diameter",
        ],
        applications: [
          "Car gearboxes & transmissions",
          "Mechanical clocks and watches",
          "Bicycle drivetrains",
          "Industrial machinery",
        ],
        tasks: [
          "Set gear 2 to twice the teeth of gear 1 and read the ratio",
          "Flip the rotation direction",
          "Slow the driver to 20 RPM and watch the output",
        ],
        challenge:
          "Configure a 3:1 reduction, then predict the output RPM before checking the result card.",
      },
      {
        id: "newtons-cradle",
        name: "Newton's cradle",
        tagline: "Conservation of momentum",
        Icon: CircleDot,
        init: cradleScene,
        mode: "Simulation",
        playKey: "animate",
        autoRotateDefault: false,
        environment: true,
        difficulty: "Beginner",
        estMinutes: 5,
        objective: "See conservation of momentum and energy play out through elastic collisions.",
        controls: [
          { kind: "slider", key: "count", label: "Spheres", min: 3, max: 7, step: 1, default: 5 },
          {
            kind: "slider",
            key: "pull",
            label: "Lifted each side",
            min: 1,
            max: 3,
            step: 1,
            default: 1,
          },
          {
            kind: "slider",
            key: "lift",
            label: "Swing angle",
            min: 0.3,
            max: 1.0,
            step: 0.05,
            default: 0.6,
          },
          { kind: "slider", key: "speed", label: "Speed", min: 0.5, max: 2, step: 0.1, default: 1 },
          { kind: "toggle", key: "animate", label: "Run simulation", default: true },
        ],
        readouts: cradleReadouts,
        toolHints: [
          "Drag to orbit the cradle",
          "Lift two balls instead of one",
          "Slow the motion down",
        ],
        summary:
          "A row of polished steel spheres that pass momentum end to end through near-perfect elastic collisions.",
        lesson: [
          "Lift one ball and let it fall: it stops dead on impact and exactly one ball flies out the far side. Momentum and kinetic energy are both conserved, so the number of balls that swing out always matches the number you lift.",
          "Lift two and two leave; the middle balls barely move because they only ever transmit the impulse. Real cradles slowly lose energy to sound and heat — this idealised one keeps swinging so you can study the principle cleanly.",
        ],
        facts: [
          { label: "Conserves", value: "momentum + KE" },
          { label: "Collision", value: "elastic" },
          { label: "Rule", value: "n in → n out" },
        ],
        concepts: [
          "Conservation of momentum",
          "Conservation of kinetic energy",
          "Elastic collisions",
          "Impulse transfer",
        ],
        applications: [
          "Vehicle crumple-zone design",
          "Billiards & snooker physics",
          "Impact & drop testing",
        ],
        tasks: [
          "Lift two balls and count how many swing out",
          "Slow the speed to watch the contact",
          "Add more spheres to the row",
        ],
        challenge: "Predict exactly how many balls swing out when you lift three, then test it.",
      },
      {
        id: "spring-hooke",
        name: "Spring & Hooke's law",
        tagline: "Simple harmonic motion",
        Icon: Waves,
        init: springScene,
        mode: "Simulation",
        playKey: "animate",
        autoRotateDefault: false,
        environment: true,
        difficulty: "Beginner",
        estMinutes: 6,
        objective: "Explore how spring stiffness and mass set the period of an oscillation.",
        controls: [
          {
            kind: "slider",
            key: "k",
            label: "Spring constant k (N/m)",
            min: 5,
            max: 60,
            step: 1,
            default: 20,
          },
          {
            kind: "slider",
            key: "mass",
            label: "Mass (kg)",
            min: 0.5,
            max: 6,
            step: 0.1,
            default: 2,
          },
          {
            kind: "slider",
            key: "amp",
            label: "Amplitude",
            min: 0.3,
            max: 2,
            step: 0.1,
            default: 1,
          },
          { kind: "toggle", key: "showForce", label: "Show force vector", default: true },
          { kind: "toggle", key: "animate", label: "Run simulation", default: true },
        ],
        readouts: springReadouts,
        chart: springChart,
        toolHints: [
          "Drag to orbit",
          "Double the mass and watch the period",
          "Toggle the restoring-force arrow",
        ],
        summary:
          "A helical spring and mass oscillating in simple harmonic motion, with the restoring force drawn live.",
        lesson: [
          "Hooke's law says a spring pulls back with a force proportional to how far it's stretched: F = −kx. That restoring force makes the mass overshoot equilibrium and oscillate.",
          "The period depends only on the mass and the stiffness — T = 2π√(m/k) — not on the amplitude. Add mass and the bounce slows; stiffen the spring and it quickens. The red arrow shows the restoring force always pointing back toward rest.",
        ],
        facts: [
          { label: "Law", value: "F = −kx" },
          { label: "Period", value: "T = 2π√(m/k)" },
          { label: "Independent of", value: "amplitude" },
        ],
        concepts: [
          "Hooke's law F = −kx",
          "Period T = 2π√(m/k)",
          "Restoring force",
          "Amplitude independence",
        ],
        applications: [
          "Vehicle suspension systems",
          "Mechanical watch balance springs",
          "Seismometers",
          "Building tuned-mass dampers",
        ],
        tasks: [
          "Double the mass and watch the period grow",
          "Stiffen the spring by raising k",
          "Turn off the force vector, then back on",
        ],
        challenge: "Find a mass and spring constant that give a period of almost exactly 1 second.",
      },
      {
        id: "double-pendulum",
        name: "Double pendulum",
        tagline: "Deterministic chaos",
        Icon: GitFork,
        init: doublePendulumScene,
        mode: "Simulation",
        playKey: "animate",
        autoRotateDefault: false,
        environment: true,
        difficulty: "Advanced",
        estMinutes: 8,
        objective:
          "Witness deterministic chaos — tiny changes in the start angle lead to wildly different motion.",
        controls: [
          {
            kind: "slider",
            key: "initAngle",
            label: "Start angle",
            min: 0.3,
            max: 3.0,
            step: 0.1,
            default: 1.6,
            rebuild: true,
          },
          {
            kind: "slider",
            key: "len1",
            label: "Arm 1 length",
            min: 0.8,
            max: 2.4,
            step: 0.1,
            default: 1.6,
          },
          {
            kind: "slider",
            key: "len2",
            label: "Arm 2 length",
            min: 0.8,
            max: 2.4,
            step: 0.1,
            default: 1.6,
          },
          {
            kind: "slider",
            key: "mass1",
            label: "Mass 1",
            min: 0.5,
            max: 3,
            step: 0.1,
            default: 1.4,
          },
          {
            kind: "slider",
            key: "mass2",
            label: "Mass 2",
            min: 0.5,
            max: 3,
            step: 0.1,
            default: 1.0,
          },
          {
            kind: "slider",
            key: "gravity",
            label: "Gravity",
            min: 2,
            max: 20,
            step: 0.5,
            default: 9.8,
          },
          { kind: "toggle", key: "animate", label: "Run simulation", default: true },
        ],
        readouts: doublePendulumReadouts,
        toolHints: [
          "Drag the start angle to relaunch",
          "Watch the golden trace go chaotic",
          "Make one arm much heavier",
        ],
        summary:
          "Two linked arms whose combined motion is famously chaotic — the lower bob traces an ever-changing path.",
        lesson: [
          "A single pendulum is perfectly predictable. Hang a second one off the first and the system becomes chaotic: its motion is fully determined by physics, yet so sensitive to the starting angle that it's effectively unpredictable.",
          "The golden trail follows the lower bob — notice it never quite repeats. Nudge the start angle by a hair (drag the slider) and the whole dance changes. This is the butterfly effect made visible.",
        ],
        facts: [
          { label: "Class", value: "chaotic system" },
          { label: "Sensitive to", value: "initial conditions" },
          { label: "Integrator", value: "8 substeps / frame" },
        ],
        concepts: [
          "Deterministic chaos",
          "Sensitivity to initial conditions",
          "Coupled oscillators",
          "Energy conservation",
        ],
        applications: [
          "Weather & climate modelling",
          "Robotics & control theory",
          "Procedural animation physics",
        ],
        tasks: [
          "Relaunch from a near-vertical start angle",
          "Make arm 2 heavier than arm 1",
          "Lower gravity and watch it slow",
        ],
        challenge:
          "Find a start angle where the trace stays smooth for a few seconds before turning chaotic.",
      },
      {
        id: "orbits",
        name: "Planetary orbits",
        tagline: "Kepler's laws in motion",
        Icon: Orbit,
        init: physicsScene,
        mode: "Simulation",
        playKey: "animate",
        autoRotateDefault: false,
        difficulty: "Beginner",
        estMinutes: 6,
        objective: "See Kepler's third law — planets farther from the star orbit more slowly.",
        controls: [
          { kind: "slider", key: "planets", label: "Planets", min: 2, max: 6, step: 1, default: 4 },
          {
            kind: "slider",
            key: "speed",
            label: "Time speed",
            min: 0.2,
            max: 2,
            step: 0.1,
            default: 1,
          },
          {
            kind: "slider",
            key: "tilt",
            label: "Orbit tilt",
            min: 0,
            max: 1.6,
            step: 0.1,
            default: 1,
          },
          { kind: "toggle", key: "showRings", label: "Show orbit rings", default: true },
          { kind: "toggle", key: "animate", label: "Run simulation", default: true },
        ],
        readouts: orbitReadouts,
        chart: orbitChart,
        toolHints: [
          "Drag to view the system edge-on",
          "Add planets and change the tilt",
          "Speed up time to compare periods",
        ],
        summary:
          "A central star lighting up to six planets, each sweeping its orbit at a speed set by its distance.",
        lesson: [
          "Each planet orbits the star at a speed fixed by how far out it sits: the inner worlds race around while the outer ones barely crawl. That inverse link between orbital radius and speed is the heart of Kepler's third law — the same rule that keeps the real Solar System in step.",
          "Add or remove planets, tilt the orbits to see the system from the side, and push time speed up to watch the inner planets lap the outer ones again and again. The result cards report the live speed ratio between the innermost and outermost bodies.",
        ],
        facts: [
          { label: "Law", value: "Kepler III — T² ∝ r³" },
          { label: "Bodies", value: "1 star + up to 6 planets" },
          { label: "Lighting", value: "single point source" },
        ],
        concepts: [
          "Kepler's third law T² ∝ r³",
          "Orbital radius vs speed",
          "Gravity as a central force",
          "Orbital period",
        ],
        applications: [
          "Satellite & spacecraft orbits",
          "Planetary science",
          "Space-mission planning",
        ],
        tasks: [
          "Add two more planets",
          "Tilt the orbits to view edge-on",
          "Speed up time and watch the inner planets lap the outer",
        ],
        challenge:
          "Estimate how many inner-planet orbits happen during a single outer-planet orbit.",
      },
      {
        id: "pendulum",
        name: "Pendulum wave",
        tagline: "Coupled simple harmonics",
        Icon: Activity,
        init: pendulumScene,
        mode: "Simulation",
        playKey: "animate",
        autoRotateDefault: false,
        difficulty: "Intermediate",
        estMinutes: 6,
        objective:
          "Watch graded-length pendulums drift in and out of phase into a travelling wave.",
        controls: [
          {
            kind: "slider",
            key: "count",
            label: "Pendulums",
            min: 4,
            max: 16,
            step: 1,
            default: 12,
          },
          {
            kind: "slider",
            key: "gravity",
            label: "Gravity",
            min: 0.5,
            max: 2,
            step: 0.05,
            default: 1,
          },
          {
            kind: "slider",
            key: "amplitude",
            label: "Swing angle",
            min: 0.2,
            max: 0.9,
            step: 0.05,
            default: 0.5,
          },
          { kind: "toggle", key: "animate", label: "Run simulation", default: true },
        ],
        readouts: pendulumReadouts,
        chart: pendulumChart,
        toolHints: [
          "Drag to orbit the row",
          "Add pendulums for a smoother wave",
          "Raise gravity to speed the swing",
        ],
        summary:
          "A row of pendulums, each slightly longer than the last, drifting in and out of phase to paint a travelling wave.",
        lesson: [
          "A simple pendulum's period depends only on its length and gravity — longer pendulums swing slower. Line up a row whose lengths step up evenly and start them together, and they immediately begin to drift out of step.",
          "The result is a mesmerising travelling wave that snakes along the row, breaks into chaos, and then re-assembles into the starting line every full cycle. Change gravity to slow the whole dance down, or add pendulums to make the wave glide more smoothly.",
        ],
        facts: [
          { label: "Period", value: "T = 2π √(L / g)" },
          { label: "Coupling", value: "none — pure phase drift" },
          { label: "Length step", value: "graded per pendulum" },
        ],
        concepts: [
          "Period depends only on length & g",
          "Phase drift",
          "Beat patterns",
          "Re-synchronisation",
        ],
        applications: [
          "Wave & oscillation demonstrations",
          "Metronome arrays",
          "Teaching resonance",
        ],
        tasks: [
          "Add pendulums for a smoother wave",
          "Lower gravity to slow it down",
          "Watch a full re-synchronisation cycle",
        ],
        challenge: "Time how long it takes the row to snap back into a straight line.",
      },
    ],
  },
  {
    slug: "engineering",
    title: "Engineering",
    tagline: "Machines & mechanisms",
    blurb:
      "Assemble a working gearbox and trace how power flows — and reduces — through a chain of meshing gears. More mechanisms coming soon.",
    Icon: Wrench,
    models: [
      {
        id: "gearbox",
        name: "Gearbox",
        tagline: "Compound gear train",
        Icon: Cog,
        init: gearTrainScene,
        mode: "Simulation",
        playKey: "animate",
        autoRotateDefault: false,
        environment: true,
        difficulty: "Intermediate",
        estMinutes: 7,
        objective:
          "Build a multi-stage gear train and see how reductions multiply through the chain.",
        controls: [
          {
            kind: "slider",
            key: "t1",
            label: "Gear 1 teeth (input)",
            min: 8,
            max: 30,
            step: 1,
            default: 14,
            rebuild: true,
          },
          {
            kind: "slider",
            key: "t2",
            label: "Gear 2 teeth",
            min: 8,
            max: 40,
            step: 1,
            default: 26,
            rebuild: true,
          },
          {
            kind: "slider",
            key: "t3",
            label: "Gear 3 teeth",
            min: 8,
            max: 30,
            step: 1,
            default: 16,
            rebuild: true,
          },
          {
            kind: "slider",
            key: "t4",
            label: "Gear 4 teeth (output)",
            min: 8,
            max: 48,
            step: 1,
            default: 32,
            rebuild: true,
          },
          {
            kind: "slider",
            key: "rpm",
            label: "Input speed (RPM)",
            min: 20,
            max: 180,
            step: 5,
            default: 90,
          },
          { kind: "toggle", key: "animate", label: "Run gearbox", default: true },
        ],
        readouts: gearTrainReadouts,
        chart: gearTrainChart,
        toolHints: [
          "Drag to orbit the gearbox",
          "Resize any gear in the chain",
          "Watch the output speed drop",
        ],
        summary:
          "Four meshing spur gears forming a gear train — power enters at one end and leaves slower but stronger at the other.",
        lesson: [
          "A gearbox chains gears together to reach a ratio a single pair can't. Each meshing pair contributes its own ratio, and they multiply along the train to give the overall reduction.",
          "Gears in the middle act as idlers — they change the direction but not the final ratio, which depends only on the first and last gears. Resize the gears and watch the output speed and overall reduction respond.",
        ],
        facts: [
          { label: "Type", value: "compound gear train" },
          { label: "Overall", value: "N_out / N_in" },
          { label: "Idlers", value: "flip direction only" },
        ],
        concepts: [
          "Compound gear trains",
          "Idler gears & direction",
          "Overall reduction = N_out / N_in",
          "Torque multiplication",
        ],
        applications: [
          "Industrial gearboxes",
          "Robotic joints & actuators",
          "Wind-turbine drivetrains",
          "Conveyor systems",
        ],
        tasks: [
          "Make the output gear the largest in the chain",
          "Match the input and output gear sizes",
          "Push the input to 180 RPM",
        ],
        challenge:
          "Configure the train for the slowest possible output, then read the overall ratio.",
      },
    ],
  },
  {
    slug: "math",
    title: "Mathematics",
    tagline: "Surfaces, curves & functions",
    blurb:
      "Drive multivariable surfaces and parametric curves in real time. Change the function, the amplitude, the frequencies — and watch the geometry respond.",
    Icon: Sigma,
    models: [
      {
        id: "surface",
        name: "Function surface",
        tagline: "z = f(x, y, t)",
        Icon: Sigma,
        init: mathScene,
        mode: "Simulation",
        playKey: "animate",
        supportsWireframe: true,
        autoRotateDefault: true,
        difficulty: "Intermediate",
        estMinutes: 8,
        objective:
          "See how a function of two variables becomes a 3D landscape with peaks, valleys, and saddles.",
        controls: [
          {
            kind: "select",
            key: "fn",
            label: "Function",
            default: "ripple",
            options: [
              { label: "Interfering ripples", value: "ripple" },
              { label: "sin(x)·cos(y)", value: "waves" },
              { label: "Saddle  x² − y²", value: "saddle" },
              { label: "Monkey saddle", value: "monkey" },
            ],
          },
          {
            kind: "slider",
            key: "amp",
            label: "Amplitude",
            min: 0.3,
            max: 1.8,
            step: 0.05,
            default: 1,
          },
          {
            kind: "slider",
            key: "freq",
            label: "Frequency",
            min: 0.3,
            max: 1.8,
            step: 0.05,
            default: 1,
          },
          { kind: "toggle", key: "wireframe", label: "Wireframe overlay", default: false },
          { kind: "toggle", key: "animate", label: "Animate over time", default: true },
        ],
        readouts: mathReadouts,
        chart: mathChart,
        toolHints: [
          "Drag to orbit the surface",
          "Scroll to zoom in and out",
          "Switch the function and amplitude",
        ],
        summary:
          "The graph of a function of two variables, colour-mapped by height and rippling through time.",
        lesson: [
          "This is the graph of a function of two variables, z = f(x, y, t). Every point on the sheet sits at a height given by the function, and the colour runs from violet in the valleys up to red on the peaks so you can read the landscape at a glance.",
          "Switch the function to compare a saddle (x² − y²), a product of sine waves, or a monkey saddle. Amplitude stretches the surface vertically; frequency packs the waves closer together. Turn on the wireframe to see the underlying mesh, and orbit it to find peaks, troughs and saddle points a flat plot could never show.",
        ],
        facts: [
          { label: "Domain", value: "x, y ∈ [−3, 3]" },
          { label: "Mesh", value: "64 × 64 quads" },
          { label: "Colour", value: "height → hue" },
        ],
        concepts: [
          "Functions of two variables z = f(x,y)",
          "Maxima, minima & saddle points",
          "Amplitude vs frequency",
          "Level sets & gradients",
        ],
        applications: [
          "Terrain & height-map generation",
          "Optimization landscapes in ML",
          "Wave interference in physics",
        ],
        tasks: [
          "Switch to the saddle and find the saddle point",
          "Raise the frequency until the ripples double",
          "Toggle the wireframe to reveal the mesh",
        ],
        challenge:
          "Find a function and amplitude where the peak height is about double the deepest valley.",
      },
      {
        id: "lissajous",
        name: "Parametric curve",
        tagline: "3D Lissajous figure",
        Icon: Spline,
        init: lissajousScene,
        mode: "Simulation",
        playKey: "animate",
        autoRotateDefault: true,
        difficulty: "Intermediate",
        estMinutes: 7,
        objective: "Discover how three independent sine waves trace a single closed 3D curve.",
        controls: [
          {
            kind: "slider",
            key: "a",
            label: "X frequency",
            min: 1,
            max: 7,
            step: 1,
            default: 3,
            rebuild: true,
          },
          {
            kind: "slider",
            key: "b",
            label: "Y frequency",
            min: 1,
            max: 7,
            step: 1,
            default: 2,
            rebuild: true,
          },
          {
            kind: "slider",
            key: "c",
            label: "Z frequency",
            min: 1,
            max: 7,
            step: 1,
            default: 4,
            rebuild: true,
          },
          { kind: "toggle", key: "animate", label: "Trace the curve", default: true },
        ],
        readouts: lissajousReadouts,
        chart: lissajousChart,
        toolHints: [
          "Drag to orbit the knot",
          "Change the frequency ratios",
          "Watch the bead trace the path",
        ],
        summary:
          "A single point moving as three independent sine waves — one per axis — sweeps out a 3D Lissajous figure.",
        lesson: [
          "A Lissajous figure is what you get when each coordinate of a moving point follows its own sine wave: x = sin(a·t), y = sin(b·t), z = sin(c·t). The three whole-number frequencies decide how the path weaves through space.",
          "Small integer ratios close into tidy knots; change one frequency and the whole figure re-laces itself. The bright bead races along the curve so you can see the single point that draws the entire shape — the same maths behind oscilloscope art and harmonographs.",
        ],
        facts: [
          { label: "Equation", value: "sin(a t), sin(b t), sin(c t)" },
          { label: "Samples", value: "600 points" },
          { label: "Closed", value: "for integer ratios" },
        ],
        concepts: [
          "Parametric equations",
          "Frequency ratios",
          "Closed vs open curves",
          "Phase relationships",
        ],
        applications: ["Oscilloscope & laser art", "Harmonographs", "Signal & vibration analysis"],
        tasks: [
          "Make a 1 : 1 : 1 figure",
          "Find a ratio that does not close",
          "Watch the bead complete one full loop",
        ],
        challenge: "Create a symmetric knot using only odd frequencies.",
      },
      {
        id: "matrix",
        name: "Matrix transformation",
        tagline: "Linear algebra in motion",
        Icon: Grid3x3,
        init: matrixScene,
        mode: "Simulation",
        playKey: "animate",
        autoRotateDefault: false,
        difficulty: "Intermediate",
        estMinutes: 7,
        objective:
          "See how a 2×2 matrix bends space — stretching, rotating, shearing and flipping the grid.",
        controls: [
          { kind: "slider", key: "a", label: "a  (î.x)", min: -2, max: 2, step: 0.1, default: 1 },
          { kind: "slider", key: "c", label: "c  (î.y)", min: -2, max: 2, step: 0.1, default: 0 },
          { kind: "slider", key: "b", label: "b  (ĵ.x)", min: -2, max: 2, step: 0.1, default: 0.5 },
          { kind: "slider", key: "d", label: "d  (ĵ.y)", min: -2, max: 2, step: 0.1, default: 1 },
          { kind: "toggle", key: "animate", label: "Morph from identity", default: true },
        ],
        readouts: matrixReadouts,
        chart: matrixChart,
        toolHints: [
          "Move a slider and watch the grid bend",
          "Make the determinant negative to flip space",
          "Set b and c to 0 for a pure scale",
        ],
        summary:
          "The plane warped by a live 2×2 matrix — the amber and indigo arrows are where the basis vectors î and ĵ land.",
        lesson: [
          "A matrix is a recipe for moving space. The columns say where the basis vectors go: the first column is where î (the amber arrow) lands, the second is where ĵ (indigo) lands. Every other point follows along, so the whole grid stretches, rotates, shears or flips as one.",
          "The determinant is the area of the parallelogram the unit square becomes — how much the transform scales area. A negative determinant means space has been flipped inside-out; a determinant of zero squashes the plane onto a line.",
        ],
        facts: [
          { label: "Columns", value: "where î and ĵ land" },
          { label: "Determinant", value: "area scale factor" },
          { label: "det < 0", value: "orientation flips" },
        ],
        concepts: [
          "Linear transformations",
          "Basis vectors î and ĵ",
          "Determinant as area scale",
          "Shear, rotation & reflection",
        ],
        applications: [
          "Computer graphics & game engines",
          "Robotics & kinematics",
          "Data transforms in ML",
          "Image warping",
        ],
        tasks: [
          "Build a 90° rotation (a=0, c=1, b=−1, d=0)",
          "Make a shear with b = 1",
          "Drive the determinant negative and watch it flip",
        ],
        challenge:
          "Find a matrix whose determinant is exactly 0, and explain what happens to the grid.",
      },
      {
        id: "calculus",
        name: "Derivative & integral",
        tagline: "The two ideas of calculus",
        Icon: LineChart,
        init: calculusScene,
        mode: "Simulation",
        autoRotateDefault: false,
        difficulty: "Advanced",
        estMinutes: 8,
        objective:
          "Drag a point along a curve to see its slope (the derivative) and the area beneath it (the integral).",
        controls: [
          {
            kind: "select",
            key: "fn",
            label: "Function",
            default: "parabola",
            rebuild: true,
            options: [
              { label: "Parabola  0.4x² − 1", value: "parabola" },
              { label: "Sine wave", value: "sine" },
              { label: "Cubic  0.18x³ − 0.6x", value: "cubic" },
              { label: "Gaussian bump", value: "gaussian" },
            ],
          },
          { kind: "slider", key: "x0", label: "Point  x₀", min: -3, max: 3, step: 0.1, default: 1 },
          {
            kind: "select",
            key: "mode",
            label: "Show",
            default: "derivative",
            options: [
              { label: "Derivative (tangent)", value: "derivative" },
              { label: "Integral (area)", value: "integral" },
            ],
          },
        ],
        readouts: calculusReadouts,
        chart: calculusChart,
        toolHints: [
          "Drag x₀ and watch the slope change",
          "Switch to Integral to shade the area",
          "Try the sine and cubic curves",
        ],
        summary:
          "A curve with a blue point you can slide: its violet tangent shows the derivative, and the amber bars fill in the integral.",
        lesson: [
          "Calculus has two big ideas, and they're two sides of the same coin. The derivative is the slope of the curve at a point — how fast the value is changing right there. Slide the point along and watch the violet tangent tip up on the way up and down on the way down; where the curve is flat, the slope is zero.",
          "The integral is the running area between the curve and the axis. Switch to Integral mode and amber bars fill in from the left up to your point — area above the axis counts positive, area below counts negative. The Fundamental Theorem of Calculus ties them together: the derivative of the area function is the original curve.",
        ],
        facts: [
          { label: "Derivative", value: "slope at a point" },
          { label: "Integral", value: "signed area" },
          { label: "Linked by", value: "the FTC" },
        ],
        concepts: [
          "Derivative as instantaneous slope",
          "Tangent lines",
          "Definite integral as area",
          "Fundamental Theorem of Calculus",
        ],
        applications: [
          "Velocity & acceleration in physics",
          "Marginal cost in economics",
          "Gradient descent in ML",
          "Areas, volumes & probability",
        ],
        tasks: [
          "Find where the parabola's slope is 0",
          "Shade the area from −3 to 0 on the sine",
          "Compare the cubic's slope at x = −1 and x = 1",
        ],
        challenge:
          "On the sine curve, find an x₀ where the integral from −3 is back to (near) zero, and explain why.",
      },
    ],
  },
  {
    slug: "science",
    title: "Science",
    tagline: "Models & structures",
    blurb:
      "Explore a real uploaded 3D cell alongside a built-in DNA helix you can re-wind. Drag to orbit, scroll to zoom, peel the model apart.",
    Icon: FlaskConical,
    models: [
      {
        id: "animal-cell",
        name: "Animal cell",
        tagline: "Eukaryotic cell anatomy",
        Icon: Boxes,
        glb: "/models/science/animal-cell.glb",
        mode: "Real model",
        supportsWireframe: true,
        autoRotateDefault: true,
        difficulty: "Beginner",
        estMinutes: 7,
        objective: "Identify the organelles of a eukaryotic animal cell and what each one does.",
        controls: [
          {
            kind: "slider",
            key: "explode",
            label: "Explode view",
            min: 0,
            max: 1.6,
            step: 0.05,
            default: 0,
          },
          { kind: "toggle", key: "wireframe", label: "Wireframe", default: false },
        ],
        readouts: (p) => [
          { label: "Cell type", value: "Eukaryotic" },
          { label: "Format", value: "glTF 2.0 (GLB)" },
          {
            label: "Explode",
            value: `${(typeof p.explode === "number" ? p.explode : 0).toFixed(2)}×`,
          },
          { label: "Shading", value: p.wireframe ? "wireframe" : "PBR" },
        ],
        toolHints: [
          "Drag to orbit the cell",
          "Scroll to zoom into organelles",
          "Pull the Explode slider to separate parts",
        ],
        summary:
          "A real eukaryotic animal cell, sliced open so you can explore its organelles from every angle.",
        lesson: [
          "This is a eukaryotic animal cell, cut away so you can see inside. Unlike a simple bacterial cell, it keeps its DNA and machinery in membrane-bound compartments called organelles, each with a specific job.",
          "The large central body is the nucleus, the cell's control centre, which holds its DNA. Around it sit the mitochondria that release energy as ATP, the endoplasmic reticulum and ribosomes that build proteins, and the Golgi apparatus that packages and ships them. The whole cell is wrapped in a selectively-permeable membrane fringed with microvilli.",
          "Drag to orbit the cell, scroll to zoom into the detail, and pull the Explode slider to push the organelles apart so you can tell them one from another.",
        ],
        facts: [
          { label: "Cell type", value: "Eukaryotic (animal)" },
          { label: "Control centre", value: "Nucleus — holds DNA" },
          { label: "Powerhouse", value: "Mitochondria — ATP" },
          { label: "Boundary", value: "Cell membrane" },
        ],
        credit: "Uploaded model · glTF 2.0 (Blender export)",
        concepts: [
          "Eukaryotic vs prokaryotic cells",
          "Membrane-bound organelles",
          "Nucleus, mitochondria, ER, Golgi",
          "Selective permeability",
        ],
        applications: ["Medicine & disease research", "Biotechnology", "Genetics & cell biology"],
        tasks: [
          "Explode the cell to separate the organelles",
          "Find the nucleus",
          "Zoom into a mitochondrion",
        ],
        challenge: "Name three organelles and the specific job each one performs.",
      },
      {
        id: "dna",
        name: "DNA double helix",
        tagline: "The molecule of life",
        Icon: Dna,
        init: scienceScene,
        mode: "Simulation",
        autoRotateDefault: true,
        difficulty: "Intermediate",
        estMinutes: 6,
        objective:
          "Understand the double-helix structure and where proteins read the genetic code.",
        controls: [
          {
            kind: "slider",
            key: "turns",
            label: "Turns",
            min: 2,
            max: 5,
            step: 1,
            default: 3,
            rebuild: true,
          },
          {
            kind: "slider",
            key: "radius",
            label: "Helix radius",
            min: 1.1,
            max: 2.4,
            step: 0.05,
            default: 1.7,
          },
          {
            kind: "slider",
            key: "twist",
            label: "Extra twist",
            min: 0,
            max: 1,
            step: 0.05,
            default: 0,
          },
          { kind: "toggle", key: "showRungs", label: "Show base pairs", default: true },
        ],
        readouts: dnaReadouts,
        toolHints: [
          "Drag to spin the helix",
          "Widen the radius or add turns",
          "Toggle the base-pair rungs",
        ],
        summary:
          "Two sugar-phosphate backbones winding around a shared axis, joined by colour-coded base-pair rungs.",
        lesson: [
          "DNA stores life's code as two sugar-phosphate backbones — drawn here in amber and blue — that wind around each other in a double helix, linked by colour-coded base pairs like rungs on a twisted ladder.",
          "Re-wind the helix with more turns, widen its radius, or add extra twist and watch the major and minor grooves open and close — the gaps where proteins dock to read the sequence. Hide the rungs to study the backbones alone.",
        ],
        facts: [
          { label: "Strands", value: "2 anti-parallel backbones" },
          { label: "Rungs", value: "complementary base pairs" },
          { label: "Grooves", value: "major + minor" },
        ],
        concepts: [
          "The double helix",
          "Sugar-phosphate backbones",
          "Complementary base pairs",
          "Major & minor grooves",
        ],
        applications: ["Genetics & heredity", "DNA sequencing", "Forensic science", "Gene therapy"],
        tasks: [
          "Add more turns to the helix",
          "Widen the helix radius",
          "Hide the base pairs to study the backbones",
        ],
        challenge: "Explain why the two strands are described as anti-parallel.",
      },
      {
        id: "neuron",
        name: "Neuron & nerve signal",
        tagline: "How a cell fires",
        Icon: Brain,
        init: neuronScene,
        mode: "Simulation",
        playKey: "animate",
        autoRotateDefault: false,
        environment: true,
        difficulty: "Intermediate",
        estMinutes: 7,
        objective:
          "Trace a nerve impulse from the dendrites, down the myelinated axon, to the terminals.",
        controls: [
          {
            kind: "slider",
            key: "dendrites",
            label: "Dendrites",
            min: 3,
            max: 8,
            step: 1,
            default: 5,
            rebuild: true,
          },
          {
            kind: "slider",
            key: "myelin",
            label: "Myelin segments",
            min: 3,
            max: 8,
            step: 1,
            default: 5,
            rebuild: true,
          },
          { kind: "toggle", key: "animate", label: "Fire the neuron", default: true },
        ],
        readouts: neuronReadouts,
        chart: neuronChart,
        toolHints: [
          "Watch the blue pulse race down the axon",
          "Add dendrites to gather more input",
          "More myelin = faster signalling",
        ],
        summary:
          "A single neuron: a soma with branching dendrites, a long myelin-sheathed axon, and terminals that pass the signal on.",
        lesson: [
          "Neurons carry information as electrical pulses. Dendrites gather signals into the cell body (soma); if they add up past a threshold, the neuron fires an action potential that shoots down the axon — the blue pulse you can watch travel here — to the terminals, where it triggers the next cell.",
          "The pale segments are the myelin sheath. It insulates the axon so the signal jumps between the gaps instead of crawling along, making transmission far faster — which is why losing myelin (as in multiple sclerosis) slows the nervous system down. The chart shows the membrane voltage during one spike.",
        ],
        facts: [
          { label: "Signal", value: "action potential" },
          { label: "Myelin", value: "speeds transmission" },
          { label: "Resting / peak", value: "−70 / +40 mV" },
        ],
        concepts: [
          "Neuron structure",
          "Action potentials",
          "Threshold & all-or-nothing firing",
          "Myelin & saltatory conduction",
        ],
        applications: [
          "Neuroscience & medicine",
          "Brain–computer interfaces",
          "Neural-network inspiration",
          "Understanding MS & nerve disease",
        ],
        tasks: [
          "Fire the neuron and follow the pulse",
          "Add dendrites to gather more input",
          "Read the voltage spike on the chart",
        ],
        challenge: "Explain why a myelinated axon transmits a signal faster than a bare one.",
      },
    ],
  },
  {
    slug: "chemistry",
    title: "Chemistry",
    tagline: "Molecules in 3D",
    blurb:
      "Orbit real molecular geometries — bent water, tetrahedral methane, a benzene ring — in ball-and-stick or space-filling form, and read their composition live.",
    Icon: Atom,
    models: [
      {
        id: "molecules",
        name: "Molecule viewer",
        tagline: "Ball-and-stick models",
        Icon: Hexagon,
        init: moleculeScene,
        mode: "Simulation",
        autoRotateDefault: true,
        environment: true,
        difficulty: "Beginner",
        estMinutes: 6,
        objective: "Explore how atoms bond into 3D shapes — and why molecular geometry matters.",
        controls: [
          {
            kind: "select",
            key: "molecule",
            label: "Molecule",
            default: "water",
            rebuild: true,
            options: [
              { label: "Water · H₂O", value: "water" },
              { label: "Methane · CH₄", value: "methane" },
              { label: "Ammonia · NH₃", value: "ammonia" },
              { label: "Carbon dioxide · CO₂", value: "co2" },
              { label: "Benzene · C₆H₆", value: "benzene" },
            ],
          },
          {
            kind: "select",
            key: "style",
            label: "Representation",
            default: "ball",
            rebuild: true,
            options: [
              { label: "Ball-and-stick", value: "ball" },
              { label: "Space-filling", value: "space" },
            ],
          },
        ],
        readouts: moleculeReadouts,
        chart: moleculeChart,
        toolHints: [
          "Drag to orbit the molecule",
          "Switch molecules to compare shapes",
          "Try the space-filling view",
        ],
        summary:
          "Real molecular geometries rendered atom by atom — oxygen in red, carbon in grey, nitrogen in blue, hydrogen in white.",
        lesson: [
          "Atoms join by sharing electrons in covalent bonds (the grey sticks). The angles between those bonds aren't random: electron pairs repel, so they spread out into set shapes — water is bent, methane is a perfect tetrahedron, carbon dioxide is straight.",
          "Switch to the space-filling view to see how big each atom really is, then orbit the benzene ring to see why flat, symmetric molecules behave so differently from three-dimensional ones. The composition chart counts the atoms of each element.",
        ],
        facts: [
          { label: "Bonds", value: "covalent (shared e⁻)" },
          { label: "Shape", value: "set by electron repulsion" },
          { label: "Colour key", value: "CPK convention" },
        ],
        credit: "Idealised geometries · CPK colour convention",
        concepts: [
          "Covalent bonding",
          "Molecular geometry (VSEPR)",
          "Bond angles",
          "Ball-and-stick vs space-filling",
        ],
        applications: [
          "Drug design & pharmacology",
          "Materials science",
          "Biochemistry",
          "Environmental chemistry",
        ],
        tasks: [
          "Compare water's bent shape to linear CO₂",
          "Count the atoms in benzene",
          "Switch methane to space-filling",
        ],
        challenge:
          "Explain why CO₂ is linear but water is bent, even though both have a central atom with two bonds.",
      },
    ],
  },
  {
    slug: "computer-science",
    title: "Computer Science",
    tagline: "Algorithms you can watch",
    blurb:
      "Watch a shuffled array sort itself bar by bar, race the classic algorithms, and see why O(n²) and O(n log n) are worlds apart.",
    Icon: Cpu,
    models: [
      {
        id: "sorting",
        name: "Sorting visualizer",
        tagline: "See an algorithm think",
        Icon: BarChart3,
        init: sortingScene,
        mode: "Simulation",
        playKey: "animate",
        autoRotateDefault: false,
        difficulty: "Intermediate",
        estMinutes: 7,
        objective:
          "Compare how sorting algorithms order data — and feel the gap between O(n²) and O(n log n).",
        controls: [
          {
            kind: "select",
            key: "algo",
            label: "Algorithm",
            default: "bubble",
            rebuild: true,
            options: [
              { label: "Bubble sort", value: "bubble" },
              { label: "Insertion sort", value: "insertion" },
              { label: "Selection sort", value: "selection" },
              { label: "Quicksort", value: "quick" },
            ],
          },
          {
            kind: "slider",
            key: "size",
            label: "Array size (n)",
            min: 6,
            max: 40,
            step: 1,
            default: 16,
            rebuild: true,
          },
          {
            kind: "slider",
            key: "speed",
            label: "Speed",
            min: 0.5,
            max: 4,
            step: 0.1,
            default: 1.5,
          },
          { kind: "toggle", key: "animate", label: "Run", default: true },
        ],
        readouts: sortingReadouts,
        chart: sortingChart,
        toolHints: [
          "Switch the algorithm and re-race",
          "Grow the array and watch the cost climb",
          "Slow it down to follow each compare",
        ],
        summary:
          "A shuffled bar chart sorting itself in real time — amber bars are being compared, green bars are locked into their final place.",
        lesson: [
          "Every bar is a number; its height is its value. The algorithm compares bars (amber) and swaps them until the row climbs neatly from left to right. Green means a bar has reached its final, sorted position.",
          "Bubble, insertion and selection sort are all O(n²): double the array and they do roughly four times the work. Quicksort averages O(n log n), so it pulls far ahead as the array grows — exactly what the comparison chart makes visible.",
        ],
        facts: [
          { label: "Bubble / Insertion / Selection", value: "O(n²)" },
          { label: "Quicksort (average)", value: "O(n log n)" },
          { label: "Green bars", value: "in final position" },
        ],
        concepts: [
          "Comparisons & swaps",
          "In-place sorting",
          "Big-O time complexity",
          "Why O(n log n) beats O(n²)",
        ],
        applications: [
          "Databases & query engines",
          "Search-result ranking",
          "Graphics & spatial indexing",
          "Any 'order this list' task",
        ],
        tasks: [
          "Race bubble vs quicksort at n = 40",
          "Slow the speed and follow one pass",
          "Watch the green sorted region grow",
        ],
        challenge: "Predict which algorithm finishes first at n = 40, then run both to check.",
      },
    ],
  },
];

export function getLabSubject(slug: string): LabSubject | undefined {
  return LAB_SUBJECTS.find((s) => s.slug === slug);
}

/** Flattened list of every model with its owning subject — for the hub gallery. */
export function allLabModels(): { subject: LabSubject; model: LabModel }[] {
  return LAB_SUBJECTS.flatMap((subject) => subject.models.map((model) => ({ subject, model })));
}

/** Build the initial live parameter values for a model from its control defaults
 *  plus the view-level defaults (auto-rotate / wireframe). */
export function modelDefaults(model: LabModel): ParamValues {
  const p: ParamValues = {};
  for (const c of model.controls ?? []) p[c.key] = c.default;
  p.autoRotate = model.autoRotateDefault ?? true;
  if (model.supportsWireframe && p.wireframe === undefined) p.wireframe = false;
  return p;
}

/** The subset of param keys whose change requires a full scene rebuild. */
export function rebuildKeysOf(model: LabModel): string[] {
  return (model.controls ?? [])
    .filter((c) => (c.kind === "slider" || c.kind === "select") && c.rebuild)
    .map((c) => c.key);
}
