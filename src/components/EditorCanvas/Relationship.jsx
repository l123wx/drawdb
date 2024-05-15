import { useRef, useEffect } from "react";
import { Cardinality } from "../../data/constants";
import { calcPath } from "../../utils/calcPath";
import { useTables, useSettings, useLayout, useCanvasElement } from "../../hooks";
import { RelationshipCanvasElement } from "../../utils/CanvasElement";

export default function Relationship({ data }) {
  const { settings } = useSettings();
  const { tables, addRelationship, updateRelationship, deleteRelationship } = useTables();
  const { layout } = useLayout();
  const { setSelectedElement, addElement, removeElementById } = useCanvasElement();
  const pathRef = useRef();

  const relationshipCanvasElement = new RelationshipCanvasElement({
    id: data.id,
    data,
    openEditor() {
      console.log('note openEditor')
      if (layout.sidebar) {
        return
      }

    },
    comeIntoView() {
      console.log('note comeIntoView')
    },
    update(newData) {
      updateRelationship(data.id, newData)
    },
    delete() {
      deleteRelationship(data.id)
    },
    duplicate() {
      addRelationship({
        ...data,
        x: data.x + 20,
        y: data.y + 20
      });
    }
  })

  useEffect(() => {
    addElement(relationshipCanvasElement)
    return () => {
      removeElementById(relationshipCanvasElement.id)
    }
  }, [])

  let cardinalityStart = "1";
  let cardinalityEnd = "1";

  switch (data.cardinality) {
    case Cardinality.MANY_TO_ONE:
      cardinalityStart = "n";
      cardinalityEnd = "1";
      break;
    case Cardinality.ONE_TO_MANY:
      cardinalityStart = "1";
      cardinalityEnd = "n";
      break;
    case Cardinality.ONE_TO_ONE:
      cardinalityStart = "1";
      cardinalityEnd = "1";
      break;
    default:
      break;
  }

  let cardinalityStartX = 0;
  let cardinalityEndX = 0;
  let cardinalityStartY = 0;
  let cardinalityEndY = 0;

  const cardinalityOffset = 28;

  if (pathRef.current) {
    const pathLength = pathRef.current.getTotalLength();
    const point1 = pathRef.current.getPointAtLength(cardinalityOffset);
    cardinalityStartX = point1.x;
    cardinalityStartY = point1.y;
    const point2 = pathRef.current.getPointAtLength(
      pathLength - cardinalityOffset,
    );
    cardinalityEndX = point2.x;
    cardinalityEndY = point2.y;
  }

  const edit = () => {
    setSelectedElement(relationshipCanvasElement)
    relationshipCanvasElement.openEditor()
    relationshipCanvasElement.comeIntoView()

    // if (!layout.sidebar) {
    //   setSelectedElement((prev) => ({
    //     ...prev,
    //     element: ObjectType.RELATIONSHIP,
    //     id: data.id,
    //     open: true,
    //   }));
    // } else {
    //   setSelectedElement((prev) => ({
    //     ...prev,
    //     currentTab: Tab.RELATIONSHIPS,
    //     element: ObjectType.RELATIONSHIP,
    //     id: data.id,
    //     open: true,
    //   }));
    //   if (selectedElement.currentTab !== Tab.RELATIONSHIPS) return;
    //   document
    //     .getElementById(`scroll_ref_${data.id}`)
    //     .scrollIntoView({ behavior: "smooth" });
    // }
  };

  return (
    <g className="select-none group" onDoubleClick={edit}>
      <path
        ref={pathRef}
        d={calcPath(
          {
            ...data,
            startTable: {
              x: tables[data.startTableId].x,
              y: tables[data.startTableId].y,
            },
            endTable: {
              x: tables[data.endTableId].x,
              y: tables[data.endTableId].y,
            },
          },
          settings.tableWidth,
        )}
        stroke="gray"
        className="group-hover:stroke-sky-700"
        fill="none"
        strokeWidth={2}
        cursor="pointer"
      />
      {pathRef.current && settings.showCardinality && (
        <>
          <circle
            cx={cardinalityStartX}
            cy={cardinalityStartY}
            r="12"
            fill="grey"
            className="group-hover:fill-sky-700"
          />
          <text
            x={cardinalityStartX}
            y={cardinalityStartY}
            fill="white"
            strokeWidth="0.5"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {cardinalityStart}
          </text>
          <circle
            cx={cardinalityEndX}
            cy={cardinalityEndY}
            r="12"
            fill="grey"
            className="group-hover:fill-sky-700"
          />
          <text
            x={cardinalityEndX}
            y={cardinalityEndY}
            fill="white"
            strokeWidth="0.5"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {cardinalityEnd}
          </text>
        </>
      )}
    </g>
  );
}
