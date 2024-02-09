import { React, useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Link } from 'react-router-dom';
import './Admin.css';

export function Admin(props) {
    const CDNURL = 'https://tymoeuinlkohesghdjpk.supabase.co/storage/v1/object/public/Notes/valentines/';
    const [images, setImages] = useState([]);
    const [update, setUpdate] = useState([]);
    const supabase = useSupabaseClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [session, setSession] = useState(null)

    const handleSignIn = async () => {
        const { user, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
    
        if (error) {
          console.error(error);
        } else {
          console.log('Signed in successfully:', user);
          setSession(true);
        }
      };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
    };

    async function getImages(){
        const { data, error } = await supabase
            .from('admin')
            .select('*')
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

    async function changeStatus(){
        const { data, error } = await supabase
            .from('admin')
            .update({
                name: update.name,
                status: !update.status,
            })
            .eq('id',update.id)
            .select()

        if(data){
            getImages();
            console.log('status changed');
        }else{
            console.log(error);
        }
    }

    useEffect(() => {
        changeStatus();
    },[update])

    return (
        <>
            <div className='content'>
                {session !== null
                ?
                <>
                    {images.map((image) => {
                        return(
                            <div className='cards'>
                                <img className='notes' src={CDNURL + image.name}/>
                                <br/>
                                {image.status === true
                                ? <button className='active' onClick={() => setUpdate(image)}> Active </button>
                                : <button className='inactive' onClick={() => setUpdate(image)}> Inactive </button>}
                            </div>
                        )
                    })}
                </>
                :
                <>
                    <div className='log-form'>
                        <label>Email:</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <label>Password:</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button className='login' onClick={handleSignIn}>Sign In</button>
                    </div>
                </>
                }
            </div>
            <Link to='/'>
                <button className='add' onClick={handleLogout}>Go back</button>
            </Link>
        </>
    )
}
