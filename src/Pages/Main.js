import React from "react";
import "./Main.css";
import { Route, Routes } from "react-router-dom";
import { Background } from "./Background";
import { Content } from "./Content";
import { AddNew } from "./AddNew";
import { Admin } from "./Admin";
import { ToastContainer, Bounce } from "react-toastify";
import bitmap from "../bitmap.svg";
import { Local } from "./Local";

const Main = () => {
  return (
    <>
      <Background />
      <Routes>
        <Route path="/" exact element={<Content />} />
        <Route path="/additional" element={<AddNew />} />
        <Route path="/administrasyones" element={<Admin />} />
        <Route path="/local" element={<Local/>}/>
      </Routes>
      <img src={bitmap} alt="FACTS Logo" className="logo" />
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
    </>
  );
};

export default Main;
