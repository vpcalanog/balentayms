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
    const [isSignUp, setIsSignUp] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSignIn = async () => {
        const { user, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error(error);
        } else {
            console.log('Signed in successfully:', email);
            setSession(true);
        }
    };

    const handleSignUp = async () => {
        if (password !== confirmPassword) {
            console.error("Passwords do not match");
            return;
        }

        const { user, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            alert(error);
        } else {
            alert('Signed up successfully:');
            setSession(true);
        }
    };

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
        const atIndex = email.indexOf('@');
        if (atIndex !== -1) {
            var current = email.slice(0, atIndex);
        }
        const { data, error } = await supabase
            .from('admin')
            .update({
                name: update.name,
                status: !update.status,
                changed_by: current,
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
        changeStatus();
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
                                        <p>Last modified by: {image.changed_by}</p>
                                </div>
                            )
                        })}
                        <button className='info' onClick={getImages}>
                        <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.7 7.7A7.1 7.1 0 0 0 5 10.8M18 4v4h-4m-7.7 8.3A7.1 7.1 0 0 0 19 13.2M6 20v-4h4"/>
                        </svg>
                        </button>
                    </>
                    :
                    <>
                        <div className='log-form'>
                            {isSignUp
                                ? <>
                                    <label>Email:</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                    <label>Password:</label>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    <label>Confirm Password:</label>
                                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                    <button className='login' onClick={handleSignUp}>Sign Up</button>
                                    <p>Already have an account? <span className='signIn' onClick={() => setIsSignUp(false)}>Sign In</span></p>
                                </>
                                : <>
                                    <label>Email:</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                    <label>Password:</label>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    <button className='login' onClick={handleSignIn}>Sign In</button>
                                    <p>Don't have an account? <span className='signIn' onClick={() => setIsSignUp(true)}>Sign Up</span></p>
                                </>
                            }
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
