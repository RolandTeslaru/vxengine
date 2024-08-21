import React, { useRef } from 'react'
import { useTimelineEditorStore } from '../../store';
import { AutoSizer, Grid, GridCellRenderer, OnScrollParams } from 'react-virtualized';
import { useDragLine } from '../edit_area/hooks/use_drag_line';

const EditArea = () => {
    const { editorData } = useTimelineEditorStore()
    const { dragLineData, initDragLine, updateDragLine, disposeDragLine, defaultGetAssistPosition, defaultGetMovePosition } = useDragLine();
    const editAreaRef = useRef<HTMLDivElement>();
    const gridRef = useRef<Grid>();
    const heightRef = useRef(-1);
    return (
        <div>

        </div>
    )
}

export default EditArea
