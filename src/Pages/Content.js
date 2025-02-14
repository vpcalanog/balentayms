import { React, useEffect, useState } from "react";
import "./Content.css";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Link } from "react-router-dom";
import logo from "../facts-logo.png";

export function Content() {
  const CDNURL =
    "https://vjuzvkupjfdakzkffpaz.supabase.co/storage/v1/object/public/Notes/valentines/";
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [imageProps, setImageProps] = useState({});
  const supabase = useSupabaseClient();

  async function getImages() {
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .eq("status", true)
      .order("id", { ascending: false });

    if (data) {
      const props = {};
      const usedPositions = new Set();
      
      data.forEach((image, index) => {
        let x, y, posKey;
        let attempts = 0;
        const maxAttempts = 50;

        do {
          // Increased radius range for better spread
          const minRadius = 20;
          const maxRadius = 55;
          const radius = Math.random() * (maxRadius - minRadius) + minRadius;
          
          // Added more randomness to angle calculation
          const baseAngle = (index * (2 * Math.PI / Math.min(data.length, 12)));
          const randomOffset = Math.random() * 0.8 - 0.4; // Increased random offset
          const angle = baseAngle + randomOffset;
          
          // Center point adjusted slightly
          x = 52 + radius * Math.cos(angle);
          y = 48 + radius * Math.sin(angle);
          
          // Increased grid size for more granular positioning
          posKey = `${Math.round(x/15)},${Math.round(y/15)}`;
          attempts++;
        } while (usedPositions.has(posKey) && attempts < maxAttempts);

        usedPositions.add(posKey);
        
        // Added slight random offset to final position
        const finalX = x + (Math.random() * 4 - 2);
        const finalY = y + (Math.random() * 4 - 2);
        
        props[image.id] = {
          rotation: `rotate-${Math.floor(Math.random() * 13)}`,
          x: finalX,
          y: finalY,
          inCircle: true,
          // Added scale variation for more visual interest
          scale: 0.9 + Math.random() * 0.2
        };
      });
      
      setImageProps(props);
      setImages(data);
    } else {
      console.error(error);
    }
  }

  useEffect(() => {
    getImages();
  }, []);

  return (
    <>
      <div className="content">
        <div className="logo-container">
          <img src={logo} alt="FACTS Logo" className="center-logo" />
          <div className="logo-text">FACTS Freedom Wall</div>
        </div>

        {images.map((image) => (
          <img
            key={image.id}
            className={`notes ${imageProps[image.id]?.rotation || ""}`}
            src={CDNURL + image.name}
            style={{
              left: `${imageProps[image.id]?.x}%`,
              top: `${imageProps[image.id]?.y}%`,
              position: 'absolute',
              transform: imageProps[image.id]?.inCircle 
                ? `translate(-50%, -50%) scale(${imageProps[image.id]?.scale})`
                : 'none',
              zIndex: Math.floor(Math.random() * 10)
            }}
            onClick={() => setPreview(image.name)}
            alt="Note"
          />
        ))}
      </div>

      <Link to="/additional">
        <button className="add">Submit Yours!</button>
      </Link>

      {preview !== null ? (
        <div className="zoom-bg">
          <img
            className="zoom"
            src={CDNURL + preview}
            onClick={() => setPreview(null)}
          />
        </div>
      ) : (
        <div className="zoom-bg empty">
          <img
            className="zoom empty"
            src={CDNURL + preview}
            onClick={() => setPreview(null)}
          />
        </div>
      )}
    </>
  );
}