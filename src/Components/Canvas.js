import React, { useEffect, useState, useRef } from "react";
import { fabric } from "fabric";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { v4 as uuidv4 } from "uuid";
import './Canvas.css';

export default function Canvas() {
  const { editor, onReady } = useFabricJSEditor();
  const fileInputRef = useRef(null);
  const history = [];
  const [color, setColor] = useState("#35363a");
  const [active, setActive] = useState(false);
  const [size, setSize] = useState('');
  const supabase = useSupabaseClient();
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (editor && editor.canvas) {
        if (event.ctrlKey && event.key === 'z') {
          undo();
        } else if ((event.ctrlKey && event.key === 'y') || (event.ctrlKey && event.shiftKey && event.key === 'Z')) {
          redo();
        }else if(event.shiftKey && event.key === 'T'){
          addText();
        }else if(event.ctrlKey && event.key === 'c'){
          toggleDraw();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
    
  }, [editor]);
  useEffect(() => {
    const handleAuxClick = (event) => {
      if (editor && editor.canvas) {
        if (event.button === 1) {
          toggleSize();
        }
      }
    };

    document.addEventListener('auxclick', handleAuxClick);

    return () => {
      document.removeEventListener('auxclick', handleAuxClick);
    };
  }, [editor]);

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }

    if (!editor.canvas.__eventListeners["mouse:wheel"]) {
      editor.canvas.on("mouse:wheel", function (opt) {
        var delta = opt.e.deltaY;
        var zoom = editor.canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        editor.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });
    }

    if (!editor.canvas.__eventListeners["mouse:down"]) {
      editor.canvas.on("mouse:down", function (opt) {
        var evt = opt.e;
        if (evt.ctrlKey === true) {
          this.isDragging = true;
          this.selection = false;
          this.lastPosX = evt.clientX;
          this.lastPosY = evt.clientY;
        }
      });
    }

    if (!editor.canvas.__eventListeners["mouse:move"]) {
      editor.canvas.on("mouse:move", function (opt) {
        if (this.isDragging) {
          var e = opt.e;
          var vpt = this.viewportTransform;
          vpt[4] += e.clientX - this.lastPosX;
          vpt[5] += e.clientY - this.lastPosY;
          this.requestRenderAll();
          this.lastPosX = e.clientX;
          this.lastPosY = e.clientY;
        }
      });
    }

    if (!editor.canvas.__eventListeners["mouse:up"]) {
      editor.canvas.on("mouse:up", function (opt) {
        this.setViewportTransform(this.viewportTransform);
        this.isDragging = false;
        this.selection = true;
      });
    }

    editor.canvas.renderAll();
  }, [editor]);

  const addBackground = () => {
    if (!editor || !fabric) {
      return;
    }

    const templateImagePath = require("./Template.png");

    fabric.Image.fromURL(templateImagePath, (image) => {
      const screenWidth = window.innerWidth;

      if (screenWidth < 600) {
        image.scaleToWidth(470);
        image.scaleToHeight(470);
      }

      editor.canvas.setBackgroundImage(
        image,
        editor.canvas.renderAll.bind(editor.canvas)
      );
    });
  };

  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    editor.canvas.setHeight(500);
    editor.canvas.setWidth(500);
    addBackground();
    editor.canvas.renderAll();
  }, [editor?.canvas.backgroundImage]);

  const toggleSize = () => {
    if(editor.canvas.freeDrawingBrush.width === 10){
      (editor.canvas.freeDrawingBrush.width = 1)
      setSize('small');
    }else{
      (editor.canvas.freeDrawingBrush.width = 10);
      setSize('large')
    }
  };

  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    editor.canvas.freeDrawingBrush.color = color;
    editor.setStrokeColor(color);
  }, [color, editor]);

  const toggleDraw = () => {
    editor.canvas.isDrawingMode = !editor.canvas.isDrawingMode;
    setActive(!active);
  };

  const undo = () => {
    if (editor.canvas._objects.length > 0) {
      history.push(editor.canvas._objects.pop());
    }
    editor.canvas.renderAll();
  };

  const redo = () => {
    if (history.length > 0) {
      editor.canvas.add(history.pop());
    }
  };

  const clear = () => {
    editor.canvas._objects.splice(0, editor.canvas._objects.length);
    history.splice(0, history.length);
    editor.canvas.renderAll();
  };

  const addText = () => {
    editor.addText("insert text");
  };

  async function logImages(logs){
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

  const saveToImage = async () => {
    const isConfirmed = window.confirm("Are you sure you want to submit the canvas?");
    
    if (isConfirmed) {
      if (!editor || !fabric) {
        return;
      }
  
      const dataURL = editor.canvas.toDataURL({
        format: "png",
        multiplier: 2,
      });
  
      const blob = await fetch(dataURL).then((res) => res.blob());
      const uid = uuidv4();
  
      const { data, error } = await supabase.storage.from('Notes').upload(`valentines/${uid}`, blob);
  
      if (data) {
        alert("Your note has been submitted, please wait as the administrators review your message");
        logImages(uid);
        clear();
      } else {
        console.error("Error uploading image:", error);
      }
    } else {
      console.log("Submission canceled.");
    }
    
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log("Selected File:", selectedFile);

    e.target.value = null;
  };

  return (
    <div className="canvas">
      <div className="side">
        <div className="controls">
          <button onClick={addText}>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 8 8" id="text"><path d="M0 0v2h.5c0-.55.45-1 1-1H3v5.5c0 .28-.22.5-.5.5H2v1h4V7h-.5c-.28 0-.5-.22-.5-.5V1h1.5c.55 0 1 .45 1 1H8V0H0z"></path></svg>
          </button>
          <label>Add Text</label>
        </div>
        <div className="controls">
          <button onClick={toggleDraw}>
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 5V4c0-.6-.4-1-1-1H9a1 1 0 0 0-.8.3l-4 4a1 1 0 0 0-.2.6V20c0 .6.4 1 1 1h12c.6 0 1-.4 1-1v-5M9 3v4c0 .6-.4 1-1 1H4m11.4.8 2.7 2.7m1.2-3.9a2 2 0 0 1 0 3l-6.6 6.6L9 18l.7-3.7 6.7-6.7a2 2 0 0 1 3 0Z"/>
            </svg>
          </button>
          <label>Toggle Draw</label>
        </div>
        <div className="controls">
          <button onClick={toggleSize}>
            {size === 'large'
            ?
            <svg className="large" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M14 4.2a4.1 4.1 0 0 1 5.8 0 4 4 0 0 1 0 5.7l-1.3 1.3-5.8-5.7L14 4.2Zm-2.7 2.7-5.1 5.2 2.2 2.2 5-5.2-2.1-2.2ZM5 14l-2 5.8c0 .3 0 .7.3 1 .3.3.7.4 1 .2l6-1.9L5 13.8Zm7 4 5-5.2-2.1-2.2-5.1 5.2 2.2 2.1Z" clip-rule="evenodd"/>
            </svg>
            :
            <svg className="small" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M14 4.2a4.1 4.1 0 0 1 5.8 0 4 4 0 0 1 0 5.7l-1.3 1.3-5.8-5.7L14 4.2Zm-2.7 2.7-5.1 5.2 2.2 2.2 5-5.2-2.1-2.2ZM5 14l-2 5.8c0 .3 0 .7.3 1 .3.3.7.4 1 .2l6-1.9L5 13.8Zm7 4 5-5.2-2.1-2.2-5.1 5.2 2.2 2.1Z" clip-rule="evenodd"/>
            </svg>
            }
            
          </button>
          <label>Pen Size</label>
        </div>
        <div className="controls">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            />
        <label>Select Color</label>
        </div>
      </div>
      <div className="center">
        <FabricJSCanvas className="sample-canvas" onReady={onReady} />
      </div>
      <div className="side">
        <div className="controls">
          <button onClick={undo}>
          <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9h13a5 5 0 0 1 0 10H7M3 9l4-4M3 9l4 4"/>
          </svg>
          </button>
          <label>Undo</label>
        </div>
        <div className="controls">
          <button onClick={redo}>
            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 9H8a5 5 0 0 0 0 10h9m4-10-4-4m4 4-4 4"/>
            </svg>
          </button>
          <label>Redo</label>
        </div>
        <div className="controls">
          <button onClick={clear}>
            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M8.6 2.6A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4c0-.5.2-1 .6-1.4ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clip-rule="evenodd"/>
            </svg>      
          </button>
          <label>Clear</label>
        </div>
        <div className="controls">
          <button onClick={saveToImage}>
            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 12 4.7 4.5 9.3-9"/>
            </svg>
          </button>
          <label>Submit</label>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={(e) => handleFileInputChange(e)}
      />
      <button className='info' onClick={toggleModal}>
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11h2v5m-2 0h4m-2.6-8.5h0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
        </svg>
      </button>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h1>Rules</h1>
            <ul>
              <li>
                <p>Spread love not hate</p>
                <p>This project was intended to be used for fun and as a platform to express yourself with the option of anonymity. So no offensive language/symbols/ideas will be tolerated</p>
              </li>
              <li>
                <p>Data Privacy</p>
                <p>We will not be taking any of your personal information so we wish that you do the same for others. Please do not include any sensitive personal information about yourself and others when submitting your notes</p>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
