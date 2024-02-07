import React, { useEffect, useState, useRef } from "react";
import { fabric } from "fabric";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { v4 as uuidv4 } from "uuid";

export default function Canvas() {
  const { editor, onReady } = useFabricJSEditor();
  const fileInputRef = useRef(null);
  const history = [];
  const [color, setColor] = useState("#35363a");
  const [cropImage, setCropImage] = useState(true);
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }

    if (cropImage) {
      editor.canvas.__eventListeners = {};
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
  }, [editor, cropImage]);

  const addBackground = () => {
    if (!editor || !fabric) {
      return;
    }

    const templateImagePath = require("./Template.png");

    fabric.Image.fromURL(templateImagePath, (image) => {
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
    editor.canvas.freeDrawingBrush.width === 12
      ? (editor.canvas.freeDrawingBrush.width = 5)
      : (editor.canvas.freeDrawingBrush.width = 12);
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
    editor.addText("inset text");
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
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log("Selected File:", selectedFile);

    e.target.value = null;
  };

  return (
    <div className="canvas">
      <div>
        <FabricJSCanvas className="sample-canvas" onReady={onReady} />
      </div>
      <button onClick={addText}>Add Text</button>
      <button onClick={toggleDraw}>Toggle draw</button>
      <button onClick={toggleSize}>ToggleSize</button>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
      <button onClick={clear}>Clear</button>
      <button onClick={saveToImage}>Save to Image</button>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={(e) => handleFileInputChange(e)}
      />
      <label></label>
      <label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </label>
    </div>
  );
}
