import { React, useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Link } from 'react-router-dom';
import './Admin.css';

export function Admin(props) {
    const CDNURL = 'https://jlyrxkjakblqzeppreod.supabase.co/storage/v1/object/public/Notes/valentines/';
    const [images, setImages] = useState([]);
    const [update, setUpdate] = useState([]);
    const supabase = useSupabaseClient();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [session, setSession] = useState(null);
    const [current, setCurrent] = useState([]);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        const savedSession = localStorage.getItem('adminSession');
        const savedUser = localStorage.getItem('adminUser');
        
        if (savedSession && savedUser) {
            setSession(true);
            setCurrent(JSON.parse(savedUser));
            getImages();
        }
    }, []);

    const handleSignIn = async () => {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        if (error || !data) {
            console.error('Invalid credentials', error);
        } else {
            console.log('Signed in successfully:', username);
            setSession(true);
            setCurrent(data);
            
            localStorage.setItem('adminSession', 'true');
            localStorage.setItem('adminUser', JSON.stringify(data));
            
            getImages();
        }
    };

    const handleLogout = async () => {
        localStorage.removeItem('adminSession');
        localStorage.removeItem('adminUser');
        
        setSession(null);
        setCurrent([]);
    };

    async function getImages() {
        const { data, error } = await supabase
            .from('entries')
            .select('*')
            .order('id', { ascending: false });

        if (data !== null) {
            setImages(data);
        }
    }

    useEffect(() => {
        getImages();
    }, []);

    async function changeStatus() {
        if (!update.id || !current.username) return;

        const { data, error } = await supabase
            .from('entries')
            .update({
                name: update.name,
                status: !update.status,
                updated_by: current.username,
            })
            .eq('id', update.id)
            .select();

        if (data) {
            getImages();
            console.log('Status changed');
        } else {
            console.log(error);
        }
    }

    useEffect(() => {
        if (update.length !== 0) {
            changeStatus();
        }
    }, [update]);

    return (
        <>
            <div className='admin-content'>
                {session !== null
                    ?
                    <>
                        {images.map((image) => {
                            return (
                                <div className='admin-notes'>
                                    <img className='notes' src={CDNURL + image.name} alt={image.name} onClick={() => setPreview(image.name)} />
                                    {image.status === true
                                        ? <button className='active' onClick={() => setUpdate(image)}> Active </button>
                                        : <button className='inactive' onClick={() => setUpdate(image)}> Inactive </button>}
                                    <p className='modify'>Last touch: <br />{image.updated_by !== null ? image.updated_by : "To be approved"}</p>
                                </div>
                            )
                        })}
                        <button className='info' onClick={getImages}>
                            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.7 7.7A7.1 7.1 0 0 0 5 10.8M18 4v4h-4m-7.7 8.3A7.1 7.1 0 0 0 19 13.2M6 20v-4h4" />
                            </svg>
                        </button>
                    </>
                    :
                    <>
                        <div className='log-form'>
                            <label>Email:</label>
                            <input type="username" value={username} onChange={(e) => setUsername(e.target.value)} />
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
            {preview !== null
                ?
                <div className='zoom-bg'>
                    <img className='zoom' src={CDNURL + preview} onClick={() => setPreview(null)} />
                </div>
                :
                <div className='zoom-bg empty'>
                    <img className='zoom empty' src={CDNURL + preview} onClick={() => setPreview(null)} />
                </div>
            }
        </>
    )
}