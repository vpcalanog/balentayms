import React, { useEffect, useRef, useState } from "react";
import "./Content.css";
import "./AddNew.css";
import "./Admin.css";
import "./Local.css";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";

export function Local() {
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const canvasWrapperRef = useRef(null);
    const { editor, onReady } = useFabricJSEditor();
    const [color, setColor] = useState('#e74c3c');
    const historyRef = useRef([]);
    
    const placedRectsRef = useRef([]);
    const removedImagesRef = useRef([]);
    
    const isPreloadedRef = useRef(false);

    const setPenColor = (newColor) => {
        setColor(newColor);
        if (editor && editor.canvas && editor.canvas.freeDrawingBrush) {
            editor.canvas.freeDrawingBrush.color = newColor;
            editor.setStrokeColor && editor.setStrokeColor(newColor);
            editor.canvas.renderAll && editor.canvas.renderAll();
        }
    };

    const undo = () => {
        if (!editor) return;
        const objs = editor.canvas.getObjects();
        if (objs.length === 0) return;
        const last = objs.pop();
        historyRef.current.push(last);
        editor.canvas.remove(last);
        editor.canvas.renderAll();
    };

    const redo = () => {
        if (!editor) return;
        const h = historyRef.current;
        if (h.length === 0) return;
        const obj = h.pop();
        editor.canvas.add(obj);
        editor.canvas.renderAll();
    };

    const clear = () => {
        if (!editor) return;
        editor.canvas.getObjects().forEach(o => editor.canvas.remove(o));
        historyRef.current = [];
        editor.canvas.renderAll();
    };

    const getRandomPositionWithoutOverlap = (contentWidth, contentHeight, thumbW, thumbH) => {
        const maxLeft = Math.max(0, contentWidth - thumbW);
        const maxTop = Math.max(0, contentHeight - thumbH);
        
        const tiers = [
            { maxAttempts: 30, buffer: 20, maxOverlapRatio: 0 },    
            { maxAttempts: 25, buffer: 0,  maxOverlapRatio: 0 },    
            { maxAttempts: 25, buffer: 0,  maxOverlapRatio: 0.3 }   
        ];

        for (const tier of tiers) {
            let attempts = 0;
            while (attempts < tier.maxAttempts) {
                const left = Math.floor(Math.random() * (maxLeft + 1));
                const top = Math.floor(Math.random() * (maxTop + 1));

                const newRect = {
                    left: left - tier.buffer,
                    top: top - tier.buffer,
                    right: left + thumbW + tier.buffer,
                    bottom: top + thumbH + tier.buffer
                };

                let validPlacement = true;

                for (const rect of placedRectsRef.current) {
                    const xOverlap = Math.max(0, Math.min(newRect.right, rect.right) - Math.max(newRect.left, rect.left));
                    const yOverlap = Math.max(0, Math.min(newRect.bottom, rect.bottom) - Math.max(newRect.top, rect.top));
                    const overlapArea = xOverlap * yOverlap;

                    if (overlapArea > 0) {
                        if (tier.maxOverlapRatio === 0) {
                            validPlacement = false;
                            break;
                        }

                        const thumbArea = thumbW * thumbH;
                        if ((overlapArea / thumbArea) > tier.maxOverlapRatio) {
                            validPlacement = false;
                            break;
                        }
                    }
                }

                if (validPlacement) {
                    placedRectsRef.current.push({
                        left,
                        top,
                        right: left + thumbW,
                        bottom: top + thumbH
                    });
                    return { left, top };
                }

                attempts++;
            }
        }

        const finalLeft = Math.floor(Math.random() * maxLeft);
        const finalTop = Math.floor(Math.random() * maxTop);
        
        placedRectsRef.current.push({
            left: finalLeft,
            top: finalTop,
            right: finalLeft + thumbW,
            bottom: finalTop + thumbH
        });

        return { left: finalLeft, top: finalTop };
    };

    const appendImageToContent = (src) => {
        const content = contentRef.current || document.querySelector('.content');
        if (!content) return;

        const img = new Image();
        img.src = src;
        img.alt = 'drawing';
        const thumbW = 160;
        const thumbH = thumbW * 0.75; 
        img.style.width = thumbW + 'px';
        img.style.height = 'auto';
        img.style.position = 'absolute';
        img.style.pointerEvents = 'none';

        const place = () => {
            const rect = content.getBoundingClientRect();
            const { left, top } = getRandomPositionWithoutOverlap(rect.width, rect.height, thumbW, thumbH);
            img.style.left = left + 'px';
            img.style.top = top + 'px';
            content.appendChild(img);
        };

        if (content.clientWidth > 0) {
            place();
        } else {
            setTimeout(place, 100);
        }
    };

    useEffect(() => {
        if (isPreloadedRef.current) return;
        isPreloadedRef.current = true;
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const content = contentRef.current || document.querySelector('.content');
            if (!content) return;

            if (event.key === "Backspace") {
                if (content.lastElementChild) {
                    event.preventDefault(); 
                    
                    const lastChild = content.lastElementChild;
                    const lastRect = placedRectsRef.current.pop();
                    
                    removedImagesRef.current.push({
                        element: lastChild,
                        rect: lastRect
                    });

                    content.removeChild(lastChild);
                }
            } 
            
            if (event.key === "Enter") {
                if (removedImagesRef.current.length > 0) {
                    event.preventDefault();

                    const restored = removedImagesRef.current.pop();
                    content.appendChild(restored.element);
                    
                    if (restored.rect) {
                        placedRectsRef.current.push(restored.rect);
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []); 

    useEffect(() => {
        if (!editor) return;
        const resize = () => {
            const wrap = canvasWrapperRef.current;
            if (!wrap) return;
            const w = wrap.offsetWidth;
            const h = wrap.offsetHeight;
            editor.canvas.setWidth(w);
            editor.canvas.setHeight(h);
            editor.canvas.renderAll();
        };

        resize();
        window.addEventListener('resize', resize);
        editor.canvas.isDrawingMode = true;
        editor.canvas.freeDrawingBrush.width = 6;
        editor.canvas.freeDrawingBrush.color = color;

        return () => window.removeEventListener('resize', resize);
    }, [editor]);

    useEffect(() => {
        if (!editor) return;
        editor.canvas.freeDrawingBrush.color = color;
        editor.setStrokeColor && editor.setStrokeColor(color);
    }, [color, editor]);

    const saveToImage = () => {
        if (!editor) return;
        const dataURL = editor.canvas.toDataURL({ format: 'png', multiplier: 2 });
        const a = document.createElement('a');
        a.href = dataURL;
        a.click();

        try {
            appendImageToContent(dataURL);
            removedImagesRef.current = [];
        } catch (e) {
            console.error('Failed to append image to content area', e);
        }
        clear();
    };

    return (
        <>
            <div className="local-panel" ref={containerRef}>
                <div className="content" ref={contentRef}></div>
                <div className="device-frame">
                    <div className="white-screen" ref={canvasWrapperRef}>
                        <FabricJSCanvas className="local-fabric-canvas" onReady={onReady} />
                    </div>

                    <div className="overlay-buttons">
                        <div className="swatch-layout">
                            <button className="swatch swatch-red" onClick={() => setPenColor('#e74c3c')} aria-label="red" />
                            <button className="swatch swatch-blue" onClick={() => setPenColor('#3498db')} aria-label="blue" />
                            <button className="swatch swatch-green" onClick={() => setPenColor('#27ae60')} aria-label="green" />
                            <button className="swatch swatch-yellow" onClick={() => setPenColor('#f1c40f')} aria-label="yellow" />
                            <button className="swatch swatch-purple" onClick={() => setPenColor('#9b59b6')} aria-label="purple" />
                        </div>

                        <button className="btn-done" onClick={saveToImage}></button>

                        <button className="btn-undo" title="Undo" onClick={undo}></button>
                        <button className="btn-redo" title="Redo" onClick={redo}></button>
                        <button className="btn-clear" title="Clear" onClick={clear}></button>
                    </div>
                </div>
            </div>
            <div className="footer">
                
            </div>
        </>
    );
}