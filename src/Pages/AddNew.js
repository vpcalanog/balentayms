import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fabric } from 'fabric';
import './AddNew.css';
import Canvas from '../Components/Canvas';

export function AddNew() {
  const canvasRef = useRef(null);
  const canvasHistory = useRef([]);
  const canvasIndex = useRef(-1);
  const [template, setTemplate] = useState('red');

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
        <div className="template-controls">
          <label className="template-label">Choose a template</label>
          <div className="swatches" role="list">
            {['red','blue','green','yellow','purple'].map((t) => (
              <button
                key={t}
                type="button"
                role="listitem"
                aria-pressed={template === t}
                className={`swatch ${template === t ? 'selected' : ''}`}
                data-color={t}
                onClick={() => setTemplate(t)}
                title={t.charAt(0).toUpperCase() + t.slice(1)}
              />
            ))}
          </div>
        </div>
        <Canvas template={template} />
      </div>
      <Link to='/'>
        <button className='back'>Go Back</button>
      </Link>
    </>
  );
}
