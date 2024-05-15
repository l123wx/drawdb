import { useRef, useState, useEffect } from "react";
import {
  Action,
  Cardinality,
  Constraint,
  ObjectType,
} from "../../data/constants";
import { Toast } from "@douyinfe/semi-ui";
import Table from "./Table";
import Area from "./Area";
import Relationship from "./Relationship";
import Note from "./Note";
import {
  useSettings,
  useTransform,
  useTables,
  useUndoRedo,
  useCanvasElement,
  useAreas,
  useNotes,
} from "../../hooks";

export default function Canvas() {
  const { tables, relationships, addRelationship } = useTables();
  const { areas, updateArea } = useAreas();
  const { notes } = useNotes();
  const { settings } = useSettings();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { transform, setTransform } = useTransform();
  const { setSelectedElement } = useCanvasElement();
  const [draggingElement, setDraggingElement] = useState(null);
  const [draggingInfo, setDraggingInfo] = useState({
    prevX: 0,
    prevY: 0,
  })
  const [linking, setLinking] = useState(false);
  const [linkingLine, setLinkingLine] = useState({
    startTableId: -1,
    startFieldId: -1,
    endTableId: -1,
    endFieldId: -1,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hoveredTable, setHoveredTable] = useState({
    tableId: -1,
    field: -2,
  });
  const [panning, setPanning] = useState({
    isPanning: false,
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
  });
  const [areaResize, setAreaResize] = useState({ id: -1, dir: "none" });
  const [initCoords, setInitCoords] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    mouseX: 0,
    mouseY: 0,
  });
  const [cursor, setCursor] = useState("default");

  const canvas = useRef(null);

  const handleMouseDownOnElement = (e, canvasElement) => {
    e.stopPropagation()

    const { clientX, clientY } = e;
    const { data } = canvasElement
    
    setDraggingElement(canvasElement);
    setOffset({
      x: clientX / transform.zoom - data.x,
      y: clientY / transform.zoom - data.y,
    });
    setDraggingInfo({
      prevX: data.x,
      prevY: data.y
    })
  };

  const handleMouseMove = (e) => {
    if (linking) {
      const rect = canvas.current.getBoundingClientRect();
      setLinkingLine({
        ...linkingLine,
        endX: (e.clientX - rect.left - transform.pan?.x) / transform.zoom,
        endY: (e.clientY - rect.top - transform.pan?.y) / transform.zoom,
      });
    } else if (panning.isPanning) {
      if (!settings.panning) {
        return;
      }
      const dx = e.clientX - panning.dx;
      const dy = e.clientY - panning.dy;
      setTransform((prev) => {
        return {
          ...prev,
          pan: { x: (prev.pan?.x || 0) + dx, y: (prev.pan?.y || 0) + dy },
        }
      });
      setPanning((prev) => ({ ...prev, dx: e.clientX, dy: e.clientY }));
    } else if (areaResize.id !== -1) {
      if (areaResize.dir === "none") return;
      let newDims = { ...initCoords };
      delete newDims.mouseX;
      delete newDims.mouseY;
      const mouseX = e.clientX / transform.zoom;
      const mouseY = e.clientY / transform.zoom;
      setPanning({ isPanning: false, x: 0, y: 0 });
      if (areaResize.dir === "br") {
        newDims.width = initCoords.width + (mouseX - initCoords.mouseX);
        newDims.height = initCoords.height + (mouseY - initCoords.mouseY);
      } else if (areaResize.dir === "tl") {
        newDims.x = initCoords.x + (mouseX - initCoords.mouseX);
        newDims.y = initCoords.y + (mouseY - initCoords.mouseY);
        newDims.width = initCoords.width - (mouseX - initCoords.mouseX);
        newDims.height = initCoords.height - (mouseY - initCoords.mouseY);
      } else if (areaResize.dir === "tr") {
        newDims.y = initCoords.y + (mouseY - initCoords.mouseY);
        newDims.width = initCoords.width + (mouseX - initCoords.mouseX);
        newDims.height = initCoords.height - (mouseY - initCoords.mouseY);
      } else if (areaResize.dir === "bl") {
        newDims.x = initCoords.x + (mouseX - initCoords.mouseX);
        newDims.width = initCoords.width - (mouseX - initCoords.mouseX);
        newDims.height = initCoords.height + (mouseY - initCoords.mouseY);
      }

      updateArea(areaResize.id, { ...newDims });
    } else if (draggingElement) {
      const dx = e.clientX / transform.zoom - offset.x;
      const dy = e.clientY / transform.zoom - offset.y;

      draggingElement.update({ x: dx, y: dy })
    }
  };

  const handleMouseDown = (e) => {
    if (draggingElement) return

    setPanning({
      isPanning: true,
      ...transform.pan,
      dx: e.clientX,
      dy: e.clientY,
    });
    setCursor("grabbing");
  };

  const coordsDidUpdate = () => {
    if (!draggingElement) return false

    return !(
      draggingInfo.prevX === draggingElement.data.x &&
      draggingInfo.prevY === draggingElement.data.y
    );
  };

  const didResize = (id) => {
    return !(
      areas[id].x === initCoords.x &&
      areas[id].y === initCoords.y &&
      areas[id].width === initCoords.width &&
      areas[id].height === initCoords.height
    );
  };

  const didPan = () =>
    !(transform.pan?.x === panning.x && transform.pan?.y === panning.y);

  const handleMouseUp = () => {
    if (coordsDidUpdate()) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.MOVE,
          element: draggingElement.type,
          x: draggingInfo.prevX,
          y: draggingInfo.prevY,
          toX: draggingElement.data.x,
          toY: draggingElement.data.y,
          id: draggingElement.id,
          message: `Move ${draggingElement.data.name} to (${draggingElement.data.x}, ${draggingElement.data.y})`,
        },
      ]);
      setRedoStack([]);
    }
    setDraggingElement(null);
    if (panning.isPanning && didPan()) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.PAN,
          undo: { x: panning.x, y: panning.y },
          redo: transform.pan,
          message: `Move diagram to (${transform.pan?.x}, ${transform.pan?.y})`,
        },
      ]);
      setRedoStack([]);
      setSelectedElement(null);
    }
    setPanning({ isPanning: false, x: 0, y: 0 });
    setCursor("default");
    if (linking) handleLinking();
    setLinking(false);
    if (areaResize.id !== -1 && didResize(areaResize.id)) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.EDIT,
          element: ObjectType.AREA,
          aid: areaResize.id,
          undo: {
            ...areas[areaResize.id],
            x: initCoords.x,
            y: initCoords.y,
            width: initCoords.width,
            height: initCoords.height,
          },
          redo: areas[areaResize.id],
          message: `Resize area`,
        },
      ]);
      setRedoStack([]);
    }
    setAreaResize({ id: -1, dir: "none" });
    setInitCoords({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      mouseX: 0,
      mouseY: 0,
    });
  };

  const handleGripField = () => {
    setPanning(false);
    setDraggingElement(null);
    setLinking(true);
  };

  const handleLinking = () => {
    if (hoveredTable.tableId < 0) return;
    if (hoveredTable.field < 0) return;
    if (
      tables[linkingLine.startTableId].fields[linkingLine.startFieldId].type !==
      tables[hoveredTable.tableId].fields[hoveredTable.field].type
    ) {
      Toast.info("Cannot connect");
      return;
    }
    if (
      linkingLine.startTableId === hoveredTable.tableId &&
      linkingLine.startFieldId === hoveredTable.field
    )
      return;

    const newRelationship = {
      ...linkingLine,
      endTableId: hoveredTable.tableId,
      endFieldId: hoveredTable.field,
      cardinality: Cardinality.ONE_TO_ONE,
      updateConstraint: Constraint.NONE,
      deleteConstraint: Constraint.NONE,
      name: `${tables[linkingLine.startTableId].name}_${
        tables[linkingLine.startTableId].fields[linkingLine.startFieldId].name
      }_fk`,
      id: relationships.length,
    };
    delete newRelationship.startX;
    delete newRelationship.startY;
    delete newRelationship.endX;
    delete newRelationship.endY;
    addRelationship(newRelationship);
  };

  const handleMouseWheel = (e) => {
    e.preventDefault();
    setTransform((prev) => ({
      ...prev,
      zoom: e.deltaY <= 0 ? prev.zoom * 1.05 : prev.zoom / 1.05,
    }));
  };

  useEffect(() => {
    const canvasElement = canvas.current;
    canvasElement.addEventListener("wheel", handleMouseWheel, {
      passive: false,
    });
    return () => {
      canvasElement.removeEventListener("wheel", handleMouseWheel);
    };
  });

  const theme = localStorage.getItem("theme");

  return (
    <div className="flex-grow h-full" id="canvas">
      <div ref={canvas} className="w-full h-full">
        <svg
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="w-full h-full"
          style={{
            cursor: cursor,
            backgroundColor: theme === "dark" ? "rgba(22, 22, 26, 1)" : "white",
          }}
        >
          {settings.showGrid && (
            <>
              <defs>
                <pattern
                  id="pattern-circles"
                  x="0"
                  y="0"
                  width="24"
                  height="24"
                  patternUnits="userSpaceOnUse"
                  patternContentUnits="userSpaceOnUse"
                >
                  <circle
                    id="pattern-circle"
                    cx="4"
                    cy="4"
                    r="0.85"
                    fill="rgb(99, 152, 191)"
                  ></circle>
                </pattern>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#pattern-circles)"
              ></rect>
            </>
          )}
          <g
            style={{
              transform: `translate(${transform.pan?.x}px, ${transform.pan?.y}px) scale(${transform.zoom})`,
              transformOrigin: "top left",
            }}
            id="diagram"
          >
            {areas.map((area) => (
              <Area
                key={area.id}
                data={area}
                onMouseDown={handleMouseDownOnElement}
                setResize={setAreaResize}
                setInitCoords={setInitCoords}
              />
            ))}
            {relationships.map((e, i) => (
              <Relationship key={i} data={e} />
            ))}
            {tables.map((table) => (
              <Table
                key={table.id}
                tableData={table}
                setHoveredTable={setHoveredTable}
                handleGripField={handleGripField}
                setLinkingLine={setLinkingLine}
                onMouseDown={handleMouseDownOnElement}
              />
            ))}
            {linking && (
              <path
                d={`M ${linkingLine.startX} ${linkingLine.startY} L ${linkingLine.endX} ${linkingLine.endY}`}
                stroke="red"
                strokeDasharray="8,8"
              />
            )}
            {notes.map((note) => (
              <Note
                key={note.id}
                data={note}
                onMouseDown={handleMouseDownOnElement}
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
