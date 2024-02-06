import React from 'react';
import './Main.css';
import { Route, Routes } from 'react-router-dom';
import { Background } from './Background';
import { Content } from './Content';
import { AddNew } from './AddNew';

const Main = () => {
  return (
    <>
      <Background/>
      <Routes>
        <Route path="/" exact element={<Content/>} />
        <Route path="/additional" element={<AddNew/>} />
      </Routes>
    </>
  );
};

export default Main;