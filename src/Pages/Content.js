import { React, useEffect, useState } from 'react';
import './Content.css';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Link } from 'react-router-dom';
import logo from '../facts-logo.png';

export function Content() {
  const CDNURL = 'https://vjuzvkupjfdakzkffpaz.supabase.co/storage/v1/object/public/Notes/valentines/';
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [imageProps, setImageProps] = useState({});
  const supabase = useSupabaseClient();

  async function getImages() {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('status', true)
      .order('id', { ascending: false });

    if (data) {
      // Scatter images around the center using polar coordinates.
      // Notes will be placed with a radius between 30% and 45% from the center.
      const props = {};
      data.forEach((image) => {
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * (45 - 30) + 30; // radius between 30% and 45%
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        props[image.id] = {
          rotation: `rotate-${Math.floor(Math.random() * 13)}`,
          x,
          y,
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
            className={`notes ${imageProps[image.id]?.rotation || ''}`}
            src={CDNURL + image.name}
            style={{
              left: `${imageProps[image.id]?.x}%`,
              top: `${imageProps[image.id]?.y}%`,
            }}
            onClick={() => setPreview(image.name)}
            alt="Note"
          />
        ))}
      </div>

      <Link to="/additional">
        <button className="add">Submit Yours!</button>
      </Link>

      {preview && (
        <div className="zoom-bg" onClick={() => setPreview(null)}>
          <img className="zoom" src={CDNURL + preview} alt="Preview" />
        </div>
      )}
    </>
  );
}
