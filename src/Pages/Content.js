import { React, useCallback, useEffect, useRef, useState } from "react";
import "./Content.css";
import Canvas from "../Components/Canvas";
import { listNotes, noteUrl } from "../services/noteStorage";
import logo from "../facts-logo.png";

// The wall re-renders on this cadence, except while a note is being previewed
// or a note is actively being drawn.
const REFRESH_INTERVAL_MS = 60000;
const TEMPLATES = ["red", "blue", "green", "yellow", "purple"];
// Notes sit at a small random tilt, pinned-to-a-corkboard style.
const MAX_TILT_DEG = 7;

// Keeps a note's half-width/height inside the wall so nothing clips.
const EDGE_X = 9;
const EDGE_Y = 10;
// Keep-out ellipse around the centre logo, in percent of the wall. It is
// tested against a note's centre, so it carries the logo's own radius plus a
// note's half-extent; otherwise notes centred just outside still cover it.
const LOGO_RX = 22;
const LOGO_RY = 24;
// Candidates weighed per placement. More means a more even wall.
const CANDIDATES = 40;

function randomPoint() {
  return {
    x: EDGE_X + Math.random() * (100 - 2 * EDGE_X),
    y: EDGE_Y + Math.random() * (100 - 2 * EDGE_Y),
  };
}

function overlapsLogo(x, y) {
  const dx = (x - 50) / LOGO_RX;
  const dy = (y - 50) / LOGO_RY;
  return dx * dx + dy * dy < 1;
}

function nearestDistance(point, placed) {
  let nearest = Infinity;
  for (let i = 0; i < placed.length; i++) {
    const dx = point.x - placed[i].x;
    const dy = point.y - placed[i].y;
    const distance = dx * dx + dy * dy;
    if (distance < nearest) nearest = distance;
  }
  return nearest;
}

// Best-candidate (Mitchell) sampling: throw several darts and keep the one
// furthest from every note already on the wall. That fills the whole area
// evenly at any count, rather than growing outwards from one spot.
function pickPoint(placed) {
  let best = null;
  let bestDistance = -1;

  for (let i = 0; i < CANDIDATES; i++) {
    const candidate = randomPoint();
    if (overlapsLogo(candidate.x, candidate.y)) continue;

    const distance = nearestDistance(candidate, placed);
    if (distance > bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }

  return best || randomPoint();
}

// Scatter positions are derived once per note and cached by id, so a refresh
// only positions newly arrived notes instead of reshuffling the whole wall.
function buildProps(data, existing) {
  const props = { ...existing };
  const placed = Object.values(props).map((p) => ({ x: p.x, y: p.y }));

  data.forEach((image) => {
    if (props[image.id]) return;

    const point = pickPoint(placed);
    placed.push(point);

    props[image.id] = {
      x: point.x,
      y: point.y,
      rotation:
        Math.round((Math.random() * 2 * MAX_TILT_DEG - MAX_TILT_DEG) * 10) / 10,
      scale: 0.9 + Math.random() * 0.2,
      depth: Math.floor(Math.random() * 10),
    };
  });

  return props;
}

export function Content() {
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [imageProps, setImageProps] = useState({});
  const [template, setTemplate] = useState("red");
  const [isDrawing, setIsDrawing] = useState(false);
  const propsRef = useRef({});

  // Stable identities keep the memoised Canvas from re-rendering on refresh.
  const handleDrawingChange = useCallback((active) => {
    setIsDrawing(active);
  }, []);

  const getImages = useCallback(async () => {
    try {
      const data = await listNotes({ onlyActive: true });
      const next = buildProps(data, propsRef.current);
      propsRef.current = next;
      setImageProps(next);
      setImages(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    getImages();
  }, [getImages]);

  // Auto refresh every minute, suspended while a note is focused for preview
  // and while a stroke is in progress, so the wall never shifts underneath the
  // person looking at it or interrupts someone mid-drawing.
  useEffect(() => {
    if (preview !== null || isDrawing) return undefined;

    const intervalId = setInterval(getImages, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [preview, isDrawing, getImages]);

  return (
    <div className="arcade-shell">
      <section className="content" aria-label="Notes wall">
        <div className="scanlines" aria-hidden="true" />
        <div className="logo-container">
          <img src={logo} alt="FACTS Logo" className="center-logo" />
        </div>

        {images.map((image) => (
          <img
            key={image.id}
            className="notes"
            src={noteUrl(image.name)}
            style={{
              left: `${imageProps[image.id]?.x}%`,
              top: `${imageProps[image.id]?.y}%`,
              position: "absolute",
              transform: `translate(-50%, -50%) rotate(${
                imageProps[image.id]?.rotation ?? 0
              }deg) scale(${imageProps[image.id]?.scale ?? 1})`,
              zIndex: imageProps[image.id]?.depth ?? 1,
            }}
            onClick={() => setPreview(image.name)}
            alt="Note"
          />
        ))}

        {/* <p className="wall-status" aria-live="polite">
          {preview !== null
            ? "PAUSED — note focused"
            : isDrawing
            ? "PAUSED — drawing in progress"
            : `AUTO-REFRESH 60s — ${images.length} note${images.length === 1 ? "" : "s"} on the wall`}
        </p> */}
      </section>

      <aside className="submit-panel" aria-label="Add a new note">
        <h2 className="panel-title">Patch Notes</h2>
        <div className="template-controls">
          <div className="swatches" role="radiogroup" aria-label="Note template colour">
            {TEMPLATES.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={template === t}
                aria-label={`${t.charAt(0).toUpperCase() + t.slice(1)} template`}
                className={`swatch ${template === t ? "selected" : ""}`}
                data-color={t}
                onClick={() => setTemplate(t)}
                title={t.charAt(0).toUpperCase() + t.slice(1)}
              />
            ))}
            
          </div>
        </div>
            <Canvas
              template={template}
              onSubmitted={getImages}
              onDrawingChange={handleDrawingChange}
            />
      </aside>

      {preview !== null && (
        <div className="zoom-bg" onClick={() => setPreview(null)}>
          <img
            className="zoom"
            src={noteUrl(preview)}
            alt="Note preview"
            onClick={() => setPreview(null)}
          />
        </div>
      )}
    </div>
  );
}
