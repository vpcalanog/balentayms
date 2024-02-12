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
    const [current, setCurrent] = useState([]);

    const handleSignIn = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            console.error(error);
        } else {
            console.log('Signed in successfully:', email);
            setSession(true);
            getCurrent();
        }
    };

    const getCurrent = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('name')
            .eq('email', email);

            if (error) {
                console.log(error);
            } else {
                setCurrent(data);
                console.log(data)
            }
    }
    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
    };

    async function getImages() {
        const { data, error } = await supabase
            .from('admin')
            .select('*')
            .order('id', { ascending: false });

        if (data !== null) {
            setImages(data);
        } else {
            alert(error);
        }
    }

    useEffect(() => {
        getImages()
    }, [])

    async function changeStatus() {
        const { data, error } = await supabase
            .from('admin')
            .update({
                name: update.name,
                status: !update.status,
                changed_by: current[0].name,
            })
            .eq('id', update.id)
            .select()

        if (data) {
            getImages();
            console.log('status changed');
        } else {
            console.log(error);
        }
    }

    useEffect(() => {
        if(update.length !== 0){
            changeStatus();
        }
    }, [update])

    return (
        <>
            <div className='content'>
                {session !== null
                    ?
                    <>
                        {images.map((image) => {
                            return (
                                <div className='cards' key={image.id}>
                                    <img className='notes' src={CDNURL + image.name} alt={image.name} />
                                    <br />
                                    {image.status === true
                                        ? <button className='active' onClick={() => setUpdate(image)}> Active </button>
                                        : <button className='inactive' onClick={() => setUpdate(image)}> Inactive </button>}
                                        <p className='modify'>Last touch: <br/>{image.changed_by}</p>
                                </div>
                            )
                        })}
                        <button className='info' onClick={getImages}>
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.7 7.7A7.1 7.1 0 0 0 5 10.8M18 4v4h-4m-7.7 8.3A7.1 7.1 0 0 0 19 13.2M6 20v-4h4"/>
                        </svg>
                        </button>
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
