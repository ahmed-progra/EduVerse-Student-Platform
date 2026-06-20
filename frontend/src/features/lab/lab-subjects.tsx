import { Sigma, Orbit, Dna } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SceneInit } from "./three-scene";
import { mathScene, physicsScene, scienceScene } from "./scenes";

export interface LabSubject {
  slug: string;
  title: string;
  tagline: string;
  blurb: string;
  concept: string;
  hint: string;
  Icon: LucideIcon;
  init: SceneInit;
}

export const LAB_SUBJECTS: LabSubject[] = [
  {
    slug: "math",
    title: "Mathematics",
    tagline: "Surfaces & functions",
    blurb: "Watch a multivariable function come alive as a rippling 3D surface you can orbit.",
    concept:
      "This is the graph of a function of two variables, z = f(x, y, t). Each point's height is the sum of interfering sine waves, so the whole surface ripples through time. Orbiting it reveals peaks, troughs, and saddle points the way a flat plot never can.",
    hint: "Drag to orbit · release to auto-rotate",
    Icon: Sigma,
    init: mathScene,
  },
  {
    slug: "physics",
    title: "Physics",
    tagline: "Orbital mechanics",
    blurb: "A radiant star and four planets sweeping their orbits — Kepler's laws in motion.",
    concept:
      "Four planets orbit a central star, each at a speed set by its distance: inner worlds race, outer ones drift. That inverse relationship between orbital radius and speed is Kepler's third law, the same rule that keeps real planets in step.",
    hint: "Drag to orbit · release to auto-rotate",
    Icon: Orbit,
    init: physicsScene,
  },
  {
    slug: "science",
    title: "Science",
    tagline: "The double helix",
    blurb: "Two backbones spiralling around a shared axis, joined by base-pair rungs.",
    concept:
      "DNA stores life's code as two sugar-phosphate backbones winding around each other, linked by colour-coded base pairs. Spinning the helix on its axis shows the major and minor grooves where proteins read the sequence.",
    hint: "Drag to orbit · release to auto-rotate",
    Icon: Dna,
    init: scienceScene,
  },
];

export function getLabSubject(slug: string): LabSubject | undefined {
  return LAB_SUBJECTS.find((s) => s.slug === slug);
}
