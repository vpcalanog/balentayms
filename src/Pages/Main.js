import React from 'react';
import './Main.css';
import { Route, Routes } from 'react-router-dom';
import { Background } from './Background';
import { Content } from './Content';
import { AddNew } from './AddNew';
import { Admin } from './Admin';
import bitmap from '../bitmap.png';

const Main = () => {
  return (
    <>
      <Background/>
      <Routes>
        <Route path="/" exact element={<Content/>} />
        <Route path="/additional" element={<AddNew/>} />
        <Route path='/administrasyones' element={<Admin/>} />
      </Routes>
      <img src={bitmap} alt='FACTS Logo' className='logo'/>
    </>
  );
};

export default Main;