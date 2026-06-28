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
  Rocket,
  Glasses,
  Triangle,
  Shapes,
  Layers,
  Link2,
  Network,
  Route,
  CircuitBoard,
  Table2,
  Zap,
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
  projectileScene,
  projectileReadouts,
  projectileChart,
  atomScene,
  atomReadouts,
  atomChart,
  opticsScene,
  opticsReadouts,
  opticsChart,
  trigScene,
  trigReadouts,
  trigChart,
  solidsScene,
  solidsReadouts,
  solidsChart,
  stackQueueScene,
  stackQueueReadouts,
  linkedListScene,
  linkedListReadouts,
  treeScene,
  treeReadouts,
  pathfindingScene,
  pathfindingReadouts,
  pathfindingChart,
  circuitScene,
  circuitReadouts,
  circuitChart,
  periodicTableScene,
  periodicTableReadouts,
  periodicTableChart,
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
      {
        id: "projectile",
        name: "Projectile motion",
        tagline: "Angle, speed & the perfect arc",
        Icon: Rocket,
        init: projectileScene,
        mode: "Simulation",
        playKey: "animate",
        autoRotateDefault: false,
        difficulty: "Beginner",
        estMinutes: 6,
        objective: "Launch a projectile and discover why 45° gives the maximum range.",
        controls: [
          {
            kind: "slider",
            key: "speed",
            label: "Launch speed (m/s)",
            min: 5,
            max: 40,
            step: 1,
            default: 20,
          },
          {
            kind: "slider",
            key: "angle",
            label: "Launch angle (°)",
            min: 10,
            max: 80,
            step: 1,
            default: 45,
          },
          {
            kind: "slider",
            key: "gravity",
            label: "Gravity (m/s²)",
            min: 2,
            max: 20,
            step: 0.1,
            default: 9.8,
          },
          { kind: "toggle", key: "animate", label: "Fire", default: true },
        ],
        readouts: projectileReadouts,
        chart: projectileChart,
        toolHints: [
          "Sweep the angle and watch the range",
          "Try 45° for maximum distance",
          "Lower gravity for a Moon shot",
        ],
        summary:
          "A ball launched across the screen tracing its parabola, with the apex marked and live range, height and flight-time.",
        lesson: [
          "Once it leaves the launcher, a projectile feels only gravity. Its motion splits cleanly into two independent parts: a steady horizontal velocity and a vertical velocity that gravity slows, stops, then reverses. Together they trace a parabola.",
          "Range is v²·sin(2θ)/g, which is largest at 45° because sin(2θ) peaks there. Push the angle higher and the ball flies higher but lands shorter; lower, and it stays flat and fast. Cut gravity and every shot carries much farther.",
        ],
        facts: [
          { label: "Range", value: "v²·sin(2θ)/g" },
          { label: "Max range", value: "at 45°" },
          { label: "Apex height", value: "v²·sin²θ/(2g)" },
        ],
        concepts: [
          "Independent x/y motion",
          "Parabolic trajectory",
          "Range vs angle",
          "Effect of gravity",
        ],
        applications: [
          "Ballistics & sport",
          "Game physics",
          "Spacecraft launch profiles",
          "Fountain & jet design",
        ],
        tasks: [
          "Find the angle for maximum range",
          "Match two angles with the same range",
          "Set gravity to the Moon's 1.6",
        ],
        challenge:
          "Find two different launch angles that land at exactly the same spot, and explain why they pair up.",
      },
      {
        id: "atom",
        name: "Atom model",
        tagline: "Shells, protons & electrons",
        Icon: Atom,
        init: atomScene,
        mode: "Simulation",
        playKey: "animate",
        autoRotateDefault: true,
        difficulty: "Beginner",
        estMinutes: 6,
        objective:
          "Build up atoms shell by shell and see how the periodic table's structure emerges.",
        controls: [
          {
            kind: "select",
            key: "element",
            label: "Element",
            default: "C",
            rebuild: true,
            options: [
              { label: "Hydrogen · H", value: "H" },
              { label: "Helium · He", value: "He" },
              { label: "Lithium · Li", value: "Li" },
              { label: "Carbon · C", value: "C" },
              { label: "Oxygen · O", value: "O" },
              { label: "Neon · Ne", value: "Ne" },
              { label: "Sodium · Na", value: "Na" },
              { label: "Silicon · Si", value: "Si" },
              { label: "Argon · Ar", value: "Ar" },
            ],
          },
          { kind: "toggle", key: "animate", label: "Orbit electrons", default: true },
        ],
        readouts: atomReadouts,
        chart: atomChart,
        toolHints: [
          "Switch elements to add shells",
          "Drag to orbit the atom",
          "Watch the valence shell fill",
        ],
        summary:
          "A Bohr-style atom: a nucleus of red protons and grey neutrons ringed by electrons orbiting in their shells.",
        lesson: [
          "An atom is mostly empty space: a tiny dense nucleus of positively-charged protons and neutral neutrons, surrounded by electrons in shells. The number of protons — the atomic number Z — defines which element it is.",
          "Shells fill from the inside out, holding up to 2n² electrons: 2, then 8, then 18. The electrons in the outermost shell, the valence electrons, decide how an atom bonds. Step through the elements and watch a new shell open exactly where a new row of the periodic table begins.",
        ],
        facts: [
          { label: "Identity", value: "set by proton count Z" },
          { label: "Shell capacity", value: "2n²" },
          { label: "Bonding", value: "valence electrons" },
        ],
        concepts: [
          "Nucleus vs electron cloud",
          "Atomic number",
          "Electron shells",
          "Valence electrons",
        ],
        applications: ["Chemical bonding", "Spectroscopy", "Nuclear physics", "The periodic table"],
        tasks: [
          "Find the first element with three shells",
          "Compare neon and argon",
          "Spot the lone valence electron in sodium",
        ],
        challenge:
          "Explain why helium and neon are both unreactive even though they have very different numbers of electrons.",
      },
      {
        id: "optics",
        name: "Thin lens optics",
        tagline: "Where the image forms",
        Icon: Glasses,
        init: opticsScene,
        mode: "Simulation",
        autoRotateDefault: false,
        difficulty: "Intermediate",
        estMinutes: 7,
        objective: "Trace rays through a lens and find where — and how big — the image appears.",
        controls: [
          {
            kind: "select",
            key: "lens",
            label: "Lens",
            default: "convex",
            rebuild: true,
            options: [
              { label: "Converging (convex)", value: "convex" },
              { label: "Diverging (concave)", value: "concave" },
            ],
          },
          {
            kind: "slider",
            key: "focal",
            label: "Focal length |f|",
            min: 0.5,
            max: 4,
            step: 0.1,
            default: 2,
          },
          {
            kind: "slider",
            key: "objDist",
            label: "Object distance u",
            min: 0.6,
            max: 8,
            step: 0.1,
            default: 4,
          },
        ],
        readouts: opticsReadouts,
        chart: opticsChart,
        toolHints: [
          "Slide the object toward the lens",
          "Cross the focal point to flip real ↔ virtual",
          "Try the diverging lens",
        ],
        summary:
          "An object arrow, a lens and two principal rays that meet to locate the image — real and inverted, or virtual and upright.",
        lesson: [
          "Two rays are enough to find an image. One leaves the object parallel to the axis and bends through the far focal point; the other passes straight through the centre of the lens undeflected. Where they cross, the image forms.",
          "For a converging lens, an object beyond the focal point gives a real, inverted image you could catch on a screen; move it inside the focal length and the image turns virtual, upright and magnified — that's a magnifying glass. A diverging lens always makes a small, upright, virtual image. The lens equation 1/f = 1/v + 1/u ties it all together.",
        ],
        facts: [
          { label: "Lens equation", value: "1/f = 1/v + 1/u" },
          { label: "Magnification", value: "m = −v/u" },
          { label: "Inside f", value: "virtual & upright" },
        ],
        concepts: [
          "Principal rays",
          "Real vs virtual images",
          "Magnification",
          "The lens equation",
        ],
        applications: ["Cameras & the eye", "Microscopes & telescopes", "Projectors", "Eyeglasses"],
        tasks: [
          "Place the object at exactly 2f",
          "Make a magnified virtual image",
          "Compare convex and concave at the same u",
        ],
        challenge:
          "Find the object distance that gives a life-size image (m = −1), and say where it sits relative to f.",
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
      {
        id: "trig",
        name: "Unit circle & trig",
        tagline: "sin, cos and the circle",
        Icon: Triangle,
        init: trigScene,
        mode: "Simulation",
        autoRotateDefault: false,
        difficulty: "Beginner",
        estMinutes: 6,
        objective:
          "Spin a radius around the unit circle and watch sine and cosine trace their waves.",
        controls: [
          {
            kind: "slider",
            key: "angle",
            label: "Angle θ (°)",
            min: 0,
            max: 360,
            step: 1,
            default: 45,
          },
        ],
        readouts: trigReadouts,
        chart: trigChart,
        toolHints: [
          "Drag the angle through a full turn",
          "Watch sin (vertical) and cos (horizontal)",
          "Find where tan blows up",
        ],
        summary:
          "A point sweeping the unit circle: its height is sin θ, its shadow on the axis is cos θ, both plotted live as waves.",
        lesson: [
          "On a circle of radius 1, the coordinates of a point at angle θ are exactly (cos θ, sin θ). The vertical amber leg is the sine; the horizontal violet leg is the cosine. As the angle turns, these legs grow and shrink between −1 and +1.",
          "Unrolled against the angle, sine and cosine become the familiar waves — the same shape, shifted by 90°. Because the point stays on the circle, cos²θ + sin²θ = 1 for every angle. Tangent is sin/cos, which shoots to infinity wherever cosine hits zero.",
        ],
        facts: [
          { label: "Coordinates", value: "(cos θ, sin θ)" },
          { label: "Identity", value: "sin² + cos² = 1" },
          { label: "tan θ", value: "sin θ / cos θ" },
        ],
        concepts: [
          "Radian & degree measure",
          "Sine & cosine as coordinates",
          "The Pythagorean identity",
          "Periodicity",
        ],
        applications: [
          "Waves & sound",
          "Circular motion",
          "Signal processing",
          "Graphics rotation",
        ],
        tasks: [
          "Find where sin and cos are equal",
          "Locate the angles where tan is undefined",
          "Read off cos 60°",
        ],
        challenge:
          "Without the readout, predict sin 150° and cos 150° from the symmetry of the circle, then check.",
      },
      {
        id: "solids",
        name: "Platonic solids",
        tagline: "Euler's V − E + F = 2",
        Icon: Shapes,
        init: solidsScene,
        mode: "Simulation",
        playKey: "animate",
        supportsWireframe: true,
        autoRotateDefault: false,
        difficulty: "Intermediate",
        estMinutes: 5,
        objective: "Rotate the five Platonic solids and verify Euler's formula on each.",
        controls: [
          {
            kind: "select",
            key: "solid",
            label: "Solid",
            default: "cube",
            rebuild: true,
            options: [
              { label: "Tetrahedron (4 faces)", value: "tetra" },
              { label: "Cube (6 faces)", value: "cube" },
              { label: "Octahedron (8 faces)", value: "octa" },
              { label: "Dodecahedron (12 faces)", value: "dodeca" },
              { label: "Icosahedron (20 faces)", value: "icosa" },
            ],
          },
          { kind: "toggle", key: "animate", label: "Rotate", default: true },
        ],
        readouts: solidsReadouts,
        chart: solidsChart,
        toolHints: [
          "Switch between the five solids",
          "Count the faces meeting at a corner",
          "Check V − E + F on each",
        ],
        summary:
          "The five Platonic solids — every face identical, every vertex the same — with their vertex, edge and face counts.",
        lesson: [
          "A Platonic solid is the most symmetric kind of polyhedron: identical regular faces, with the same number meeting at every vertex. Remarkably, there are exactly five — the Greeks proved no sixth can exist.",
          "However you rotate them, every convex polyhedron obeys Euler's formula: vertices minus edges plus faces always equals 2. Read the counts off each solid and check it — the cube's 8 − 12 + 6, the icosahedron's 12 − 30 + 20, all land on 2.",
        ],
        facts: [
          { label: "How many", value: "exactly five" },
          { label: "Euler", value: "V − E + F = 2" },
          { label: "Faces", value: "all identical & regular" },
        ],
        concepts: [
          "Regular polyhedra",
          "Vertices, edges & faces",
          "Euler's formula",
          "Symmetry & duality",
        ],
        applications: [
          "Crystallography",
          "Dice & games",
          "Molecular geometry",
          "Architecture & domes",
        ],
        tasks: [
          "Verify Euler's formula on the cube",
          "Find the dual of the cube",
          "Count the edges on the icosahedron",
        ],
        challenge:
          "The cube and octahedron are 'duals'. Compare their V and F counts and explain the swap.",
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
      {
        id: "periodic-table",
        name: "Periodic table",
        tagline: "Elements 1–36",
        Icon: Table2,
        init: periodicTableScene,
        mode: "Simulation",
        autoRotateDefault: false,
        difficulty: "Beginner",
        estMinutes: 6,
        objective:
          "Slide through the elements to see how the periodic table is organised by number and family.",
        controls: [
          {
            kind: "slider",
            key: "z",
            label: "Atomic number (Z)",
            min: 1,
            max: 36,
            step: 1,
            default: 6,
          },
        ],
        readouts: periodicTableReadouts,
        chart: periodicTableChart,
        toolHints: [
          "Slide Z to highlight an element",
          "Notice the colour-coded families",
          "Watch mass climb on the chart",
        ],
        summary:
          "The first four periods laid out as a colour-coded grid; pick an atomic number to spotlight an element and read its properties.",
        lesson: [
          "The periodic table is ordered by atomic number — the proton count — and wraps into rows so that elements with similar behaviour line up in columns. Each colour here marks a family: reactive alkali metals on the left, the block of transition metals, the nonmetals and halogens, and the unreactive noble gases on the right.",
          "Position is destiny: an element's column predicts how it bonds, and its row tells you how many electron shells it has. Atomic mass generally rises with atomic number, though a few famous inversions — like argon sitting just before potassium — show that it's proton count, not mass, that sets the order.",
        ],
        facts: [
          { label: "Ordered by", value: "atomic number Z" },
          { label: "Columns", value: "shared chemical family" },
          { label: "Rows", value: "electron shells" },
        ],
        credit: "Periods 1–4 · standard atomic weights",
        concepts: [
          "Atomic-number ordering",
          "Periods & groups",
          "Element families",
          "Periodic trends",
        ],
        applications: [
          "Predicting reactions",
          "Materials selection",
          "Chemistry education",
          "Industrial processes",
        ],
        tasks: [
          "Find the three alkali metals",
          "Compare a metal and a noble gas",
          "Spot the Ar/K mass inversion",
        ],
        challenge:
          "Argon has a greater atomic mass than potassium, yet comes first. Explain what really sets the order.",
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
      {
        id: "stack-queue",
        name: "Stack & queue",
        tagline: "LIFO vs FIFO",
        Icon: Layers,
        init: stackQueueScene,
        mode: "Simulation",
        playKey: "animate",
        autoRotateDefault: false,
        difficulty: "Beginner",
        estMinutes: 5,
        objective: "Watch how a stack and a queue add and remove items from opposite ends.",
        controls: [
          {
            kind: "select",
            key: "mode",
            label: "Structure",
            default: "stack",
            options: [
              { label: "Stack (LIFO)", value: "stack" },
              { label: "Queue (FIFO)", value: "queue" },
            ],
          },
          { kind: "toggle", key: "animate", label: "Run operations", default: true },
        ],
        readouts: stackQueueReadouts,
        toolHints: [
          "Switch between stack and queue",
          "Watch where the green 'active' end is",
          "Compare which item leaves first",
        ],
        summary:
          "Boxes pushed and popped in real time — a stack grows and shrinks from the top, a queue from the front.",
        lesson: [
          "A stack is last-in, first-out: you add and remove at the same end, the top. Think of a stack of plates — the last one you set down is the first you pick up. The green box marks that active top.",
          "A queue is first-in, first-out: you add at the back but remove from the front, like a line at a counter. Both add and remove in O(1) time, but the order items leave in is completely different — and that choice drives everything from undo history (stack) to print jobs (queue).",
        ],
        facts: [
          { label: "Stack", value: "LIFO — last in, first out" },
          { label: "Queue", value: "FIFO — first in, first out" },
          { label: "Both", value: "O(1) add & remove" },
        ],
        concepts: [
          "LIFO vs FIFO",
          "Push/pop & enqueue/dequeue",
          "O(1) operations",
          "Choosing the right structure",
        ],
        applications: [
          "Undo / redo (stack)",
          "The call stack",
          "Print & task queues",
          "Breadth-first search",
        ],
        tasks: [
          "Watch the stack's top item leave first",
          "Watch the queue's front item leave first",
          "Predict the next item out",
        ],
        challenge:
          "You can only use stacks. Describe how you'd use two of them to behave like a single queue.",
      },
      {
        id: "linked-list",
        name: "Linked list",
        tagline: "Nodes joined by pointers",
        Icon: Link2,
        init: linkedListScene,
        mode: "Simulation",
        playKey: "animate",
        autoRotateDefault: false,
        difficulty: "Beginner",
        estMinutes: 5,
        objective:
          "See how a linked list chains nodes with pointers — and why reaching the n-th one costs O(n).",
        controls: [
          {
            kind: "slider",
            key: "length",
            label: "Nodes",
            min: 2,
            max: 7,
            step: 1,
            default: 5,
            rebuild: true,
          },
          { kind: "toggle", key: "animate", label: "Traverse", default: true },
        ],
        readouts: linkedListReadouts,
        toolHints: [
          "Add nodes with the slider",
          "Follow the traversal highlight",
          "Notice there's no random access",
        ],
        summary:
          "A chain of nodes, each pointing to the next, with a sweeping highlight that walks from the head to the tail.",
        lesson: [
          "Unlike an array, a linked list doesn't sit in one contiguous block. Each node holds a value plus a pointer to the next node, so the list can live scattered in memory and grow without being resized.",
          "The cost is access: there's no jumping straight to the fifth element — you must start at the head and follow pointers one by one, which is O(n). In return, inserting or removing at a known position is O(1): you just re-link a pointer instead of shifting everything along.",
        ],
        facts: [
          { label: "Node", value: "value + next pointer" },
          { label: "Access i-th", value: "O(n)" },
          { label: "Insert at head", value: "O(1)" },
        ],
        concepts: ["Nodes & pointers", "Sequential access", "Insertion vs arrays", "Heads & tails"],
        applications: [
          "Media playlists",
          "Undo histories",
          "Hash-table chaining",
          "Memory allocators",
        ],
        tasks: [
          "Follow the highlight head to tail",
          "Add nodes and re-traverse",
          "Picture re-linking to insert",
        ],
        challenge:
          "Reaching the last node is O(n). What single extra pointer would make appending to the end O(1)?",
      },
      {
        id: "binary-tree",
        name: "Binary tree traversal",
        tagline: "In, pre & post-order",
        Icon: Network,
        init: treeScene,
        mode: "Simulation",
        playKey: "animate",
        autoRotateDefault: false,
        difficulty: "Intermediate",
        estMinutes: 6,
        objective:
          "Watch the three depth-first traversals visit a binary tree's nodes in different orders.",
        controls: [
          {
            kind: "select",
            key: "traversal",
            label: "Traversal",
            default: "inorder",
            options: [
              { label: "In-order (L · root · R)", value: "inorder" },
              { label: "Pre-order (root · L · R)", value: "preorder" },
              { label: "Post-order (L · R · root)", value: "postorder" },
            ],
          },
          { kind: "toggle", key: "animate", label: "Play traversal", default: true },
        ],
        readouts: treeReadouts,
        toolHints: [
          "Switch traversals to change the order",
          "Watch the green 'current' node",
          "Note where the root is visited",
        ],
        summary:
          "A seven-node binary tree lighting up in traversal order — the visited path glows amber, the current node green.",
        lesson: [
          "A binary tree branches: each node has up to two children, a left and a right. To visit every node we recurse, and the moment we choose to 'visit' the node relative to its children gives three different orders.",
          "In-order goes left, node, right — on a binary search tree that prints the values sorted. Pre-order visits the node first (great for copying a tree), and post-order visits it last (great for deleting one, children before parent). Same tree, same recursion, three useful orderings.",
        ],
        facts: [
          { label: "In-order", value: "sorted, on a BST" },
          { label: "Pre-order", value: "copy / serialise" },
          { label: "Post-order", value: "delete / evaluate" },
        ],
        concepts: [
          "Binary tree structure",
          "Recursion",
          "Depth-first traversal",
          "In / pre / post-order",
        ],
        applications: [
          "Expression evaluation",
          "File-system walks",
          "Search trees",
          "Compiler syntax trees",
        ],
        tasks: [
          "Find the order that visits the root first",
          "Find the order that visits it last",
          "Read the in-order sequence",
        ],
        challenge:
          "If in-order gives sorted output, what does that tell you about how the values are arranged in the tree?",
      },
      {
        id: "pathfinding",
        name: "Pathfinding",
        tagline: "BFS, Dijkstra & A*",
        Icon: Route,
        init: pathfindingScene,
        mode: "Simulation",
        playKey: "animate",
        autoRotateDefault: false,
        difficulty: "Advanced",
        estMinutes: 8,
        objective:
          "Race three search algorithms across a maze and see why A* explores the fewest cells.",
        controls: [
          {
            kind: "select",
            key: "algorithm",
            label: "Algorithm",
            default: "astar",
            rebuild: true,
            options: [
              { label: "Breadth-first (BFS)", value: "bfs" },
              { label: "Dijkstra", value: "dijkstra" },
              { label: "A* search", value: "astar" },
            ],
          },
          { kind: "toggle", key: "animate", label: "Search", default: true },
        ],
        readouts: pathfindingReadouts,
        chart: pathfindingChart,
        toolHints: [
          "Switch algorithms and re-search",
          "Count the explored (amber) cells",
          "Compare the bar chart",
        ],
        summary:
          "A grid maze with start (green) and goal (red): explored cells fill in amber, then the shortest path lights up.",
        lesson: [
          "All three algorithms find a shortest path on this uniform grid, but they explore very differently. BFS fans out in even rings from the start, checking near cells before far ones — it has no idea where the goal is.",
          "Dijkstra generalises BFS to weighted graphs by always expanding the cheapest-so-far cell. A* adds a heuristic — here, the straight-line distance left to the goal — so it expands cells that head toward the target first. The result is the same path with far fewer cells explored, which the comparison chart makes obvious.",
        ],
        facts: [
          { label: "BFS", value: "explores in even rings" },
          { label: "Dijkstra", value: "cheapest-first" },
          { label: "A*", value: "goal-directed heuristic" },
        ],
        concepts: ["Graph search", "Frontiers & visited sets", "Heuristics", "Shortest paths"],
        applications: [
          "Game & robot navigation",
          "GPS routing",
          "Network packet routing",
          "Puzzle solving",
        ],
        tasks: [
          "Compare BFS and A* explored counts",
          "Watch BFS fan out evenly",
          "Confirm all three find the same path",
        ],
        challenge:
          "A* relies on its heuristic never over-estimating the true distance. Why would an over-estimate risk a longer path?",
      },
    ],
  },
  {
    slug: "electronics",
    title: "Electronics",
    tagline: "Circuits & Ohm's law",
    blurb:
      "Wire up a battery, resistors and an LED, then watch the current — and the LED's brightness — respond live to Ohm's law.",
    Icon: CircuitBoard,
    models: [
      {
        id: "circuit",
        name: "Circuit & Ohm's law",
        tagline: "V = IR, brought to life",
        Icon: Zap,
        init: circuitScene,
        mode: "Simulation",
        playKey: "animate",
        autoRotateDefault: false,
        difficulty: "Beginner",
        estMinutes: 6,
        objective:
          "Change the voltage and resistors and watch current, power and LED brightness follow Ohm's law.",
        controls: [
          {
            kind: "slider",
            key: "voltage",
            label: "Battery (V)",
            min: 1,
            max: 12,
            step: 0.5,
            default: 9,
          },
          {
            kind: "slider",
            key: "r1",
            label: "Resistor R₁ (Ω)",
            min: 1,
            max: 20,
            step: 1,
            default: 6,
          },
          {
            kind: "slider",
            key: "r2",
            label: "Resistor R₂ (Ω)",
            min: 1,
            max: 20,
            step: 1,
            default: 6,
          },
          {
            kind: "select",
            key: "config",
            label: "Wiring",
            default: "series",
            rebuild: true,
            options: [
              { label: "Series", value: "series" },
              { label: "Parallel", value: "parallel" },
            ],
          },
          { kind: "toggle", key: "animate", label: "Current flow", default: true },
        ],
        readouts: circuitReadouts,
        chart: circuitChart,
        toolHints: [
          "Raise the voltage and watch the LED",
          "Switch series ↔ parallel",
          "Compare the current readout",
        ],
        summary:
          "A battery driving current around a loop through two resistors to an LED whose glow tracks the current in real time.",
        lesson: [
          "Ohm's law is the workhorse of electronics: current equals voltage divided by resistance, I = V/R. Raise the battery voltage and more current flows; add resistance and the current — and the LED's brightness — drops.",
          "How you wire resistors matters. In series the resistances simply add, so the total is larger and the current smaller. In parallel the current splits between branches, so the combined resistance is actually less than either resistor alone and more total current flows. Power dissipated is P = V·I.",
        ],
        facts: [
          { label: "Ohm's law", value: "I = V / R" },
          { label: "Series", value: "R = R₁ + R₂" },
          { label: "Parallel", value: "R = R₁R₂ / (R₁+R₂)" },
        ],
        concepts: [
          "Voltage, current & resistance",
          "Ohm's law",
          "Series vs parallel",
          "Electrical power",
        ],
        applications: [
          "Every electronic device",
          "LED & lighting design",
          "Battery sizing",
          "Sensor circuits",
        ],
        tasks: [
          "Double the voltage and watch I double",
          "Switch to parallel and watch I rise",
          "Find the settings for the brightest LED",
        ],
        challenge:
          "Two equal resistors: explain why wiring them in parallel lets MORE current flow than a single one alone.",
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
