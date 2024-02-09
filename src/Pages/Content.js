import { React, useEffect, useState } from 'react';
import './Content.css'
import { Note } from '../Components/Note'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Link } from 'react-router-dom';

export function Content(props) {
    const CDNURL = 'https://tymoeuinlkohesghdjpk.supabase.co/storage/v1/object/public/Notes/valentines/';
    const [images, setImages] = useState([]);
    const supabase = useSupabaseClient();

    async function getImages(){
        const { data, error } = await supabase
            .from('admin')
            .select('*')
            .eq('status', true)
            .order('id', { ascending: false });

            if(data!== null) {
              setImages(data);
            }else{
              alert(error);
            }
    }

    useEffect(() => {
        getImages()
    },[])

    return (
        <>
            <div className='content'>
                {images.map((image) => {
                    return(
                    <img className='notes' src={CDNURL + image.name}/>
                    )
                })}
            </div>
            <Link to='/additional'>
                <button className='add'>Submit Yours!</button>
            </Link>
        </>
    )
}
