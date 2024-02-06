import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fabric } from 'fabric';
import './AddNew.css';
import Canvas from '../Components/Canvas';

export function AddNew() {
  const canvasRef = useRef(null);
  const canvasHistory = useRef([]);
  const canvasIndex = useRef(-1);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
    });

    canvas.freeDrawingBrush.width = 5;

    canvas.on('path:created', () => {
      saveCanvasState(canvas);
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  const saveCanvasState = (canvas) => {
    const jsonData = canvas.toJSON();
    canvasHistory.current = canvasHistory.current.slice(0, canvasIndex.current + 1);
    canvasHistory.current.push(jsonData);
    canvasIndex.current = canvasHistory.current.length - 1;
  };

  const handleUndo = () => {
    if (canvasIndex.current > 0) {
      canvasIndex.current--;
      loadCanvasState(canvasRef.current, canvasHistory.current[canvasIndex.current]);
    }
  };

  const loadCanvasState = (canvas, jsonData) => {
    canvas.loadFromJSON(jsonData, () => {
      canvas.renderAll();
    });
  };

  return (
    <>
      <div className='content'>
        <Canvas/>
        {/* <canvas ref={canvasRef} width={800} height={600} /> */}
      </div>
      {/* <button className='undo' onClick={handleUndo}>
        Undo
      </button> */}
      <Link to='/'>
        <button className='back'>Go Back</button>
      </Link>
    </>
  );
}
