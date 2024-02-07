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

  return (
    <>
      <div className='content'>
        <Canvas/>
      </div>
      <Link to='/'>
        <button className='back'>Go Back</button>
      </Link>
    </>
  );
}
