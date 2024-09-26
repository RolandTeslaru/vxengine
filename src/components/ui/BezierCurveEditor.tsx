import React, { useState, useEffect, useMemo } from "react";
import classNames from "classnames";
import { create } from "zustand"
// @ts-expect-error
import styles from "./bezierCurveStyles.module.scss"

const defaultStateValue = {
  value: [0.4, 0, 1, 0.6], // easeIn
  startValue: [0.4, 0, 1, 0.6],
  movingStartHandle: false,
  movingStartHandleStart: { x: 0, y: 0 },
  movingEndHandle: false,
  movingEndHandleStart: { x: 0, y: 0 }
};

interface CurveStoreProps {
  value: number[];
  movingStartHandle: boolean;
  movingEndHandle: boolean;
  movingStartHandleStart: { x: number; y: number };
  movingEndHandleStart: { x: number; y: number };

  setValue: (newValue: number[]) => void;
  setMovingStartHandle: (isMoving: boolean) => void;
  setMovingEndHandle: (isMoving: boolean) => void;
  setMovingStartHandleStart: (coords: { x: number; y: number }) => void;
  setMovingEndHandleStart: (coords: { x: number; y: number }) => void;
}

export const createCurveStore = (defaultValues) =>
  create<CurveStoreProps>((set) => ({
    value: defaultValues,
    movingStartHandle: false,
    movingEndHandle: false,
    movingStartHandleStart: { x: 0, y: 0 },
    movingEndHandleStart: { x: 0, y: 0 },

    setValue: (newValue) => set({ value: newValue }),
    setMovingStartHandle: (isMoving) => set({ movingStartHandle: isMoving }),
    setMovingEndHandle: (isMoving) => set({ movingEndHandle: isMoving }),
    setMovingStartHandleStart: (coords) => set({ movingStartHandleStart: coords }),
    setMovingEndHandleStart: (coords) => set({ movingEndHandleStart: coords }),
  }));

const BezierCurveEditor = ({
  size = 200,
  outerAreaSize = 50,
  strokeWidth = 2,
  handleLineStrokeWidth = 1,
  borderRadiusContainer = 0,
  fixedHandleColor = "white", // the circles in the bottom left and top right
  curveLineColor = "white",
  handleLineColor,
  startHandleColor = "",
  endHandleColor = "",
  className = "",
  startHandleClassName = "",
  startHandleActiveClassName = "",
  endHandleClassName = "",
  endHandleActiveClassName = "",
  value,
  onChange,
}) => {
  const useCurveStore = useMemo(() => createCurveStore(value), [] )

  const {
    value: bezierValue,
    movingStartHandle,
    movingEndHandle,
    setValue,
    setMovingStartHandle,
    setMovingEndHandle,
    movingEndHandleStart,
    movingStartHandleStart,
    setMovingStartHandleStart,
    setMovingEndHandleStart,
  } = useCurveStore();


  const width = size;
  const height = width;
  const startCoordinate = [0, height];
  const endCoordinate = [width, 0];
  const startBezierHandle = [width * bezierValue[0], height * (1 - bezierValue[1])];
  const endBezierHandle = [width * bezierValue[2], height * (1 - bezierValue[3])];

  const svgWidth = width + strokeWidth * 2;
  const svgHeight = height + strokeWidth * 2 + outerAreaSize * 2;

  const stopMovingAll = () => {
    setMovingStartHandle(false);
    setMovingEndHandle(false);
  };

  const moveHandles = (x, y) => {
    const relevantStart = movingStartHandle ? movingStartHandleStart : movingEndHandleStart;

    if (movingStartHandle || movingEndHandle) {
      const relXMoved = (x - relevantStart.x) / width;
      const relYMoved = (y - relevantStart.y) / height;
      const nextValue = [...bezierValue];

      if (movingStartHandle) {
        nextValue[0] = nextValue[0] + relXMoved;
        nextValue[1] = nextValue[1] - relYMoved;
      }

      if (movingEndHandle) {
        nextValue[2] = nextValue[2] + relXMoved;
        nextValue[3] = nextValue[3] - relYMoved;
      }

      const clampedValue = clampValue(nextValue);
      if (onChange) onChange(clampedValue);

      setValue(clampedValue);
    }
  };

  const clampValue = (value) => {
    const allowedOuterValue = outerAreaSize / height;
    const nextValue = [...value];
    nextValue[0] = Math.max(0, Math.min(1, nextValue[0]));
    nextValue[2] = Math.max(0, Math.min(1, nextValue[2]));
    nextValue[1] = Math.max(-allowedOuterValue, Math.min(1 + allowedOuterValue, nextValue[1]));
    nextValue[3] = Math.max(-allowedOuterValue, Math.min(1 + allowedOuterValue, nextValue[3]));
    return nextValue;
  };

  const handleStartHandleStartMoving = (event) => {
    if (!movingStartHandle) {
      event.preventDefault();
      let startX = event.type === 'touchstart' ? event.touches[0].screenX : event.screenX;
      let startY = event.type === 'touchstart' ? event.touches[0].screenY : event.screenY;

      setMovingStartHandle(true);
      setMovingStartHandleStart({ x: startX, y: startY });
    }
  };

  const handleEndHandleStartMoving = (event) => {
    if (!movingEndHandle) {
      event.preventDefault();
      let startX = event.type === 'touchstart' ? event.touches[0].screenX : event.screenX;
      let startY = event.type === 'touchstart' ? event.touches[0].screenY : event.screenY;

      setMovingEndHandle(true);
      setMovingEndHandleStart({ x: startX, y: startY });
    }
  };

  const handleWindowTouchMove = (event) => {
    if (movingStartHandle || movingEndHandle) {
      const x = event.touches[0].screenX;
      const y = event.touches[0].screenY;
      moveHandles(x, y);
    }
  };

  const handleWindowMouseMove = (event) => {
    if (movingStartHandle || movingEndHandle) {
      const x = event.screenX;
      const y = event.screenY;
      moveHandles(x, y);
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('touchmove', handleWindowTouchMove);
    window.addEventListener('mouseup', stopMovingAll);
    window.addEventListener('touchend', stopMovingAll);
    window.addEventListener('mouseleave', stopMovingAll);
    window.addEventListener('touchcancel', stopMovingAll);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('mouseup', stopMovingAll);
      window.removeEventListener('touchend', stopMovingAll);
      window.removeEventListener('mouseleave', stopMovingAll);
      window.removeEventListener('touchcancel', stopMovingAll);
    };
  }, [movingStartHandle, movingEndHandle]);

  return (
    <div
      className={classNames({
        [styles.rootContainer]: true,
        [className]: !!className,
      })}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: `${borderRadiusContainer}px`,
      }}
    >
      <div className={styles.wrap}>
        <svg className={styles.curve} fill="none" width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          <g transform={`translate(${strokeWidth}, ${outerAreaSize + strokeWidth})`}>
            <line
              stroke={handleLineColor || styles.colorHandleLine}
              strokeWidth={handleLineStrokeWidth}
              strokeLinecap="round"
              x1={startCoordinate[0]}
              y1={startCoordinate[1]}
              x2={startBezierHandle[0]}
              y2={startBezierHandle[1]}
            />
            <line
              stroke={handleLineColor || styles.colorHandleLine}
              strokeWidth={handleLineStrokeWidth}
              strokeLinecap="round"
              x1={endCoordinate[0]}
              y1={endCoordinate[1]}
              x2={endBezierHandle[0]}
              y2={endBezierHandle[1]}
            />
            <path
              stroke={curveLineColor || styles.colorCurveLine}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              d={`M${startCoordinate} C${startBezierHandle} ${endBezierHandle} ${endCoordinate}`}
            />
          </g>
        </svg>
        <span
          className={styles.connectionPoint}
          style={{
            top: `${startCoordinate[1] + outerAreaSize + strokeWidth}px`,
            left: `${startCoordinate[0] + strokeWidth}px`,
            borderColor: handleLineColor,
            backgroundColor: fixedHandleColor,
          }}
        />
        <span
          className={styles.connectionPoint}
          style={{
            top: `${endCoordinate[1] + outerAreaSize + strokeWidth}px`,
            left: `${endCoordinate[0] + strokeWidth}px`,
            borderColor: handleLineColor,
            backgroundColor: fixedHandleColor,
          }}
        />
        <button
          type="button"
          className={classNames({
            [styles.handle]: true,
            [styles.start]: true,
            [startHandleClassName]: !!startHandleClassName,
            [styles.active]: movingStartHandle,
            [startHandleActiveClassName]: !!startHandleActiveClassName && movingStartHandle,
          })}
          style={{
            top: `${startBezierHandle[1] + outerAreaSize + strokeWidth}px`,
            left: `${startBezierHandle[0] + strokeWidth}px`,
            color: startHandleColor,
            backgroundColor: startHandleColor,
          }}
          onMouseDown={handleStartHandleStartMoving}
          onTouchStart={handleStartHandleStartMoving}
        />
        <button
          type="button"
          className={classNames({
            [styles.handle]: true,
            [styles.end]: true,
            [endHandleClassName]: !!endHandleClassName,
            [styles.active]: movingEndHandle,
            [endHandleActiveClassName]: !!endHandleActiveClassName && movingEndHandle,
          })}
          style={{
            top: `${endBezierHandle[1] + outerAreaSize + strokeWidth}px`,
            left: `${endBezierHandle[0] + strokeWidth}px`,
            color: endHandleColor,
            backgroundColor: endHandleColor,
          }}
          onMouseDown={handleEndHandleStartMoving}
          onTouchStart={handleEndHandleStartMoving}
        />
      </div>
    </div>
  );
};
export default BezierCurveEditor;
