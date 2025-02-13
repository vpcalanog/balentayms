import { React, useEffect, useState } from 'react';
import './Content.css';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Link } from 'react-router-dom';

export function Content(props) {
    const CDNURL = 'https://vjuzvkupjfdakzkffpaz.supabase.co/storage/v1/object/public/Notes/valentines/';
    const [images, setImages] = useState([]);
    const [preview, setPreview] = useState(null);
    const [imageRotations, setImageRotations] = useState({});
    const supabase = useSupabaseClient();
    
    async function getImages() {
        const { data, error } = await supabase
            .from('entries')
            .select('*')
            .eq('status', true)
            .order('id', { ascending: false });

        if (data !== null) {
            // Generate and store rotation classes when images are loaded
            const rotations = {};
            data.forEach(image => {
                rotations[image.id] = `rotate-${Math.floor(Math.random() * 13)}`;
            });
            setImageRotations(rotations);
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
                {images.map((image) => (
                    <img
                        key={image.id}
                        className={`notes ${imageRotations[image.id] || ''}`}
                        src={CDNURL + image.name}
                        onClick={() => setPreview(image.name)}
                        alt="Note"
                    />
                ))}
            </div>
            
            <Link to="/additional">
                <button className="add">Submit Yours!</button>
            </Link>

            {preview && (
                <div 
                    className="zoom-bg"
                    onClick={() => setPreview(null)}
                >
                    <img 
                        className="zoom"
                        src={CDNURL + preview}
                        alt="Preview"
                    />
                </div>
            )}

            {!preview && (
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
