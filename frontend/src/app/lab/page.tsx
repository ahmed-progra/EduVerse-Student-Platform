"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Boxes, ArrowRight, Star, Clock, Gauge, Sparkles } from "lucide-react";
import { LAB_SUBJECTS, allLabModels } from "@/features/lab/lab-subjects";

const FAV_KEY = "eduverse_lab_favorites";
const LAST_KEY = "eduverse_lab_last";

export default function LabHubPage() {
  const models = allLabModels();
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [last, setLast] = useState<{ subject: string; model: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setFavs(new Set(JSON.parse(raw) as string[]));
      const l = localStorage.getItem(LAST_KEY);
      if (l) setLast(JSON.parse(l));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleFav = (id: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const favModels = models.filter(({ model }) => favs.has(model.id));
  const lastEntry = last
    ? models.find(({ subject, model }) => subject.slug === last.subject && model.id === last.model)
    : null;
  const totalModels = models.length;

  const Card = ({ subject, model }: (typeof models)[number]) => (
    <div className="lab-gcard glass-panel">
      <div className="lab-gcard-top">
        <span className="lab-gcard-badge">{subject.title}</span>
        <button
          className={`lab-gcard-fav ${favs.has(model.id) ? "active" : ""}`}
          onClick={() => toggleFav(model.id)}
          aria-pressed={favs.has(model.id)}
          aria-label={favs.has(model.id) ? "Remove from favourites" : "Add to favourites"}
        >
          <Star size={15} aria-hidden="true" fill={favs.has(model.id) ? "currentColor" : "none"} />
        </button>
      </div>
      <span className="lab-gcard-icon">
        <model.Icon size={24} aria-hidden="true" />
      </span>
      <h3 className="lab-gcard-title">{model.name}</h3>
      <p className="lab-gcard-obj">{model.objective ?? model.summary}</p>
      <div className="lab-gcard-meta">
        {model.difficulty && (
          <span className={`lab-gcard-diff diff-${model.difficulty.toLowerCase()}`}>
            <Gauge size={11} aria-hidden="true" /> {model.difficulty}
          </span>
        )}
        {model.estMinutes && (
          <span className="lab-gcard-time">
            <Clock size={11} aria-hidden="true" /> {model.estMinutes} min
          </span>
        )}
      </div>
      <Link href={`/lab/${subject.slug}?model=${model.id}`} className="lab-gcard-open">
        Open model <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );

  return (
    <div className="space-y-10 page-enter">
      <div>
        <div className="section-label">
          <span className="section-label-prefix">//</span> Interactive
        </div>
        <div className="lab-hero">
          <span className="lab-hero-icon">
            <Boxes size={26} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">3D Lab</h1>
            <p className="text-eduverse-text-muted mt-1">
              {totalModels} interactive, orbitable 3D models across {LAB_SUBJECTS.length} subjects.
              Drag to explore, tune the parameters, learn by doing.
            </p>
          </div>
        </div>
      </div>

      {/* Continue + favourites */}
      {lastEntry && (
        <div>
          <div className="section-label" style={{ marginBottom: 12 }}>
            <span className="section-label-prefix">//</span> Continue learning
          </div>
          <Link
            href={`/lab/${lastEntry.subject.slug}?model=${lastEntry.model.id}`}
            className="lab-continue glass-panel glass-panel-link"
          >
            <span className="lab-gcard-icon">
              <lastEntry.model.Icon size={22} aria-hidden="true" />
            </span>
            <div className="lab-continue-text">
              <span className="lab-gcard-badge">{lastEntry.subject.title}</span>
              <h3 className="lab-gcard-title">{lastEntry.model.name}</h3>
            </div>
            <span className="lab-continue-go">
              Resume <ArrowRight size={15} aria-hidden="true" />
            </span>
          </Link>
        </div>
      )}

      {favModels.length > 0 && (
        <div>
          <div className="section-label" style={{ marginBottom: 12 }}>
            <span className="section-label-prefix">//</span> Your favourites
          </div>
          <div className="lab-gallery">
            {favModels.map((m) => (
              <Card key={`fav-${m.subject.slug}-${m.model.id}`} {...m} />
            ))}
          </div>
        </div>
      )}

      {/* All models */}
      <div>
        <div className="section-label" style={{ marginBottom: 12 }}>
          <span className="section-label-prefix">//</span>{" "}
          <Sparkles size={13} className="inline -mt-0.5" aria-hidden="true" /> All models
        </div>
        <div className="lab-gallery">
          {models.map((m) => (
            <Card key={`${m.subject.slug}-${m.model.id}`} {...m} />
          ))}
        </div>
      </div>

      {/* Browse by subject */}
      <div>
        <div className="section-label" style={{ marginBottom: 12 }}>
          <span className="section-label-prefix">//</span> Browse by subject
        </div>
        <div className="lab-grid">
          {LAB_SUBJECTS.map((s) => (
            <Link
              key={s.slug}
              href={`/lab/${s.slug}`}
              className="lab-card glass-panel glass-panel-link"
            >
              <span className="lab-card-icon">
                <s.Icon size={24} aria-hidden="true" />
              </span>
              <div className="lab-card-tag">
                {s.models.length} model{s.models.length > 1 ? "s" : ""} · {s.tagline}
              </div>
              <h2 className="lab-card-title">{s.title}</h2>
              <p className="lab-card-blurb">{s.blurb}</p>
              <span className="lab-card-go">
                Launch lab <ArrowRight size={15} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
