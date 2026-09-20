import { React, useCallback, useEffect, useRef, useState } from "react";
import "./Content.css";
import Canvas from "../Components/Canvas";
import { listNotes, noteUrl } from "../services/noteStorage";
import logo from "../facts-logo.png";

// The wall re-renders on this cadence, except while a note is being previewed.
const REFRESH_INTERVAL_MS = 15000;
const TEMPLATES = ["red", "blue", "green", "yellow", "purple"];

// Scatter positions are derived once per note and cached by id, so a refresh
// only positions newly arrived notes instead of reshuffling the whole wall.
function buildProps(data, existing) {
  const props = { ...existing };
  const usedPositions = new Set(
    Object.values(existing).map((p) => p.posKey).filter(Boolean)
  );

  data.forEach((image, index) => {
    if (props[image.id]) return;

    let x, y, posKey;
    let attempts = 0;
    const maxAttempts = 50;

    do {
      const minRadius = 10;
      const maxRadius = 55;
      const radius = Math.random() * (maxRadius - minRadius) + minRadius;

      const baseAngle = index * ((2 * Math.PI) / Math.min(data.length, 12));
      const randomOffset = Math.random() * 0.8 - 0.4;
      const angle = baseAngle + randomOffset;

      x = 52 + radius * Math.cos(angle);
      y = 48 + radius * Math.sin(angle);

      posKey = `${Math.round(x / 15)},${Math.round(y / 15)}`;
      attempts++;
    } while (usedPositions.has(posKey) && attempts < maxAttempts);

    usedPositions.add(posKey);

    let finalX = x + (Math.random() * 4 - 2);
    let finalY = y + (Math.random() * 4 - 2);

    const minPercent = 8;
    const maxPercent = 92;

    finalX = Math.min(Math.max(finalX, minPercent), maxPercent);
    finalY = Math.min(Math.max(finalY, minPercent), maxPercent);

    props[image.id] = {
      rotation: `rotate-${Math.floor(Math.random() * 13)}`,
      x: finalX,
      y: finalY,
      posKey,
      inCircle: true,
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
  const propsRef = useRef({});

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

  // Auto refresh every 15s, suspended while a note is focused for preview so
  // the wall never shifts underneath the person looking at it.
  useEffect(() => {
    if (preview !== null) return undefined;

    const intervalId = setInterval(getImages, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [preview, getImages]);

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
            className={`notes ${imageProps[image.id]?.rotation || ""}`}
            src={noteUrl(image.name)}
            style={{
              left: `${imageProps[image.id]?.x}%`,
              top: `${imageProps[image.id]?.y}%`,
              position: "absolute",
              transform: imageProps[image.id]?.inCircle
                ? `translate(-50%, -50%) scale(${imageProps[image.id]?.scale})`
                : "none",
              zIndex: imageProps[image.id]?.depth ?? 1,
            }}
            onClick={() => setPreview(image.name)}
            alt="Note"
          />
        ))}

        <p className="wall-status" aria-live="polite">
          {preview !== null
            ? "PAUSED — note focused"
            : `AUTO-REFRESH 15s — ${images.length} note${images.length === 1 ? "" : "s"} on the wall`}
        </p>
      </section>

      <aside className="submit-panel" aria-label="Add a new note">
        <h2 className="panel-title">Insert Coin</h2>
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
        <Canvas template={template} onSubmitted={getImages} />
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
