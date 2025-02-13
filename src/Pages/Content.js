import { React, useEffect, useState } from 'react';
import './Content.css';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Link } from 'react-router-dom';

export function Content(props) {
    const CDNURL = 'https://vjuzvkupjfdakzkffpaz.supabase.co/storage/v1/object/public/Notes/valentines/';
    const [images, setImages] = useState([]);
    const [preview, setPreview] = useState(null);
    const supabase = useSupabaseClient();
    
    async function getImages() {
        const { data, error } = await supabase
            .from('entries')
            .select('*')
            .eq('status', true)
            .order('id', { ascending: false });

        if (data !== null) {
            setImages(data);
        } else {
            console.error(error);
        }
    }

    useEffect(() => {
        const fetchAndRotateImages = async () => {
            await getImages();

            const imagesElements = document.querySelectorAll('.notes');
            imagesElements.forEach((img) => {
                const randomClass = `rotate-${Math.floor(Math.random() * 13)}`; 
                img.classList.add(randomClass);
            });

            console.log('Images rotated');
        };

        fetchAndRotateImages(); 
    }, []); 

    return (
        <>
            <div className='content'>
                {images.map((image) => (
                    <img
                        key={image.id}
                        className='notes'
                        src={CDNURL + image.name}
                        onClick={() => setPreview(image.name)}
                        alt="Note"
                    />
                ))}
            </div>
            <Link to='/additional'>
                <button className='add'>Submit Yours!</button>
            </Link>

            {preview !== null
                ? (
                    <div className='zoom-bg'>
                        <img className='zoom' src={CDNURL + preview} onClick={() => setPreview(null)} />
                    </div>
                )
                : (
                    <div className='zoom-bg empty'>
                        <img className='zoom empty' src={CDNURL + preview} onClick={() => setPreview(null)} />
                    </div>
                )
            }
        </>
    );
}
