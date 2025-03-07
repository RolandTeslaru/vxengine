export interface CurveStoreProps {
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