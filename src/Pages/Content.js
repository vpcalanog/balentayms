import { React, useEffect, useState } from 'react';
import './Content.css'
import { Note } from '../Components/Note'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';

export function Content(props) {
    const CDNURL = 'https://tymoeuinlkohesghdjpk.supabase.co/storage/v1/object/public/Notes/valentines/';
    const [logs, setLogs] = useState(null);
    const [approved, setApproved] = useState([]);
    const [images, setImages] = useState([]);
    const supabase = useSupabaseClient();
  
    async function logImages(){
        const newLog = {
            name: logs,
        }
        const { data,error } = await supabase
        .from('admin')
        .insert(newLog)
        .select()

        if (error) {
            console.log(error)
        }
        if (data) {
            console.log(data)
        }
    };

    async function getImages(){
        const { data, error } = await supabase
            .from('admin')
            .select('*')
            .eq('status', true);
            if(data!== null) {
              setImages(data);
            }else{
              alert(error);
            }
    }

  
    async function uploadImage(e) {
        let file = e.target.files[0];
        let uid = uuidv4();
        setLogs(uid)

        
        const { data, error } = await supabase
          .storage
          .from('Notes')
          .upload('valentines/' + uid, file)
        
          if(data){
            logImages();
            getImages();
          }else{
            console.log(error);
          }
    }

    useEffect(() => {
        getImages()
    },[])

    return (
        <>
            <div className='content'>
                {/* <form>
                    <input
                    type='file'
                    onChange={(e) => uploadImage(e)}
                    ></input>
                </form> */}
                {images.map((image) => {
                    return(
                    <img src={CDNURL + image.name}/>
                    )
                })}
            </div>
            <Link to='/additional'>
                <button className='add'>Submit Yours!</button>
            </Link>
        </>
    )
}
