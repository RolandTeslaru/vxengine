import { Interactable } from '@interactjs/core/Interactable';
import { DragEvent, ResizeEvent } from '@interactjs/types/index';
import React, { ReactElement, useCallback, useEffect, useImperativeHandle, useRef, forwardRef, memo } from 'react';
import { useAutoScroll } from './hooks/useAutoScroll';
import { DEFAULT_ADSORPTION_DISTANCE, DEFAULT_MOVE_GRID, DEFAULT_START_LEFT } from '@vxengine/AnimationEngine/interface/const';
import { useRefStore } from '@vxengine/utils/useRefStore';
import { Direction, RowRndApi, RowRndProps } from './row_rnd_interface';
import { InteractComp } from './interactable';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/store';
import { computeScrollLeft } from '@vxengine/managers/TimelineManager/utils/computeScrollLeft';

const handleUpdateLeft = (interactable, deltaX, left: number, reset = true) => {
  if (!interactable.current || !interactable.current.target) return;
  reset && (deltaX.current = 0);
  const target = interactable.current.target as HTMLElement;
  target.style.left = `${left}px`;
  Object.assign(target.dataset, { left });
};

export const RowDnd = memo(forwardRef<RowRndApi, RowRndProps>(
  (
    {
      children,
      edges,
      left,
      width,

      start = DEFAULT_START_LEFT,
      grid = DEFAULT_MOVE_GRID,
      bounds = {
        left: Number.MIN_SAFE_INTEGER,
        right: Number.MAX_SAFE_INTEGER,
      },
      enableResizing = true,
      enableDragging = true,
      adsorptionDistance = DEFAULT_ADSORPTION_DISTANCE,
      adsorptionPositions = [],
      onResizeStart,
      onResize,
      onResizeEnd,
      onDragStart,
      onDragEnd,
      onDrag,
    },
    ref,
  ) => {
    const interactable = useRef<Interactable>();
    const deltaX = useRef(0);
    const isAdsorption = useRef(false);
    const editAreaRef = useRefStore(state => state.editAreaRef)
    const { initAutoScroll, dealDragAutoScroll, dealResizeAutoScroll, stopAutoScroll } = useAutoScroll(editAreaRef);

    useEffect(() => {
      return () => {
        interactable.current && interactable.current.unset();
      };
    }, []);

    useImperativeHandle(ref, () => ({
      updateLeft: (left) => handleUpdateLeft(interactable, deltaX, left || 0, false),
      getLeft: handleGetLeft,
      getWidth: handleGetWidth,
    }), []);

    useEffect(() => {
      handleUpdateLeft(interactable, deltaX, left || 0, false);
    }, [left]);

    const handleGetLeft = () => {
      const target = interactable.current.target as HTMLElement;
      return parseFloat(target?.dataset?.left || '0');
    };
    const handleGetWidth = () => {
      const target = interactable.current.target as HTMLElement;
      return parseFloat(target?.dataset?.width || '0');
    };
    //#endregion

    //#region [rgba(188,188,120,0.05)] 回调api
    const handleMoveStart = useCallback((e: DragEvent) => {
      deltaX.current = 0;
      isAdsorption.current = false;
      initAutoScroll();
      onDragStart && onDragStart();
    }, [])

    const move = useCallback((param: { preLeft: number; preWidth: number; scrollDelta?: number }) => {
      const { preLeft, preWidth, scrollDelta } = param;
      const distance = isAdsorption.current ? adsorptionDistance : grid;
      if (Math.abs(deltaX.current) >= distance) {
        const count = parseInt(deltaX.current / distance + '');
        let curLeft = preLeft + count * distance;

        //Control adsorption
        let adsorption = curLeft;
        let minDis = Number.MAX_SAFE_INTEGER;
        adsorptionPositions.forEach((item) => {
          const dis = Math.abs(item - curLeft);
          if (dis < adsorptionDistance && dis < minDis) adsorption = item;
          const dis2 = Math.abs(item - (curLeft + preWidth));
          if (dis2 < adsorptionDistance && dis2 < minDis) adsorption = item - preWidth;
        });

        if (adsorption !== curLeft) {
          //Use adsorption data
          isAdsorption.current = true;
          curLeft = adsorption;
        } else {
          //Control the grid
          if ((curLeft - start) % grid !== 0) {
            curLeft = start + grid * Math.round((curLeft - start) / grid);
          }
          isAdsorption.current = false;
        }
        deltaX.current = deltaX.current % distance;

        // 控制bounds
        if (curLeft < bounds.left) curLeft = bounds.left;
        else if (curLeft + preWidth > bounds.right) curLeft = bounds.right - preWidth;

        if (onDrag) {
          const ret = onDrag(
            {
              lastLeft: preLeft,
              left: curLeft,
              lastWidth: preWidth,
              width: preWidth,
            },
            scrollDelta,
          );
          if (ret === false) return;
        }

        handleUpdateLeft(interactable, deltaX, curLeft, false);
      }
    }, []);

    const handleMove = useCallback((e: DragEvent) => {
      const target = e.target;

      // if (editAreaRef.current) {
      //   const result = dealDragAutoScroll(e, (delta) => {
      //     computeScrollLeft(delta);

      //     let { left, width } = target.dataset;
      //     const preLeft = parseFloat(left);
      //     const preWidth = parseFloat(width);
      //     deltaX.current += delta;
      //     move({ preLeft, preWidth, scrollDelta: delta });
      //   });
      //   if (!result) return;
      // }

      let { left, width } = target.dataset;
      const preLeft = parseFloat(left);
      const preWidth = parseFloat(width);

      deltaX.current += e.dx;
      move({ preLeft, preWidth });
    }, [])

    const handleMoveStop = useCallback((e: DragEvent) => {
      deltaX.current = 0;
      isAdsorption.current = false;
      stopAutoScroll();

      const target = e.target;
      let { left, width } = target.dataset;
      onDragEnd && onDragEnd({ left: parseFloat(left), width: parseFloat(width) });
    }, []);

   


    //#endregion

    return (
      // FIXME: idk
      <InteractComp
        interactRef={interactable}
        draggable={enableDragging}
        draggableOptions={{
          lockAxis: 'x',
          onmove: handleMove,
          onstart: handleMoveStart,
          onend: handleMoveStop,
          cursorChecker: () => {
            return null;
          },
        }}
   
      >
        {React.cloneElement(children as ReactElement, {
          style: {
            ...((children as ReactElement).props.style || {}),
            left,
            width,
          },
        })}
      </InteractComp>
    );
  },
));