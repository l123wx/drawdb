import { createContext, useState } from "react";
import { nanoid } from "nanoid";
import { Action, ObjectType, defaultBlue } from "../data/constants";
import { useTransform, useUndoRedo, useCanvasElement } from "../hooks";

export const TablesContext = createContext(null);

export default function TablesContextProvider({ children }) {
  const [tables, setTables] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const { transform } = useTransform();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { setSelectedElement, isElementSelected } = useCanvasElement();

  const addTable = (data, addToHistory = true) => {
    if (data) {
      setTables((prev) => {
        data.id = nanoid()
        data.key = Date.now()

        const temp = prev.slice();
        temp.splice(data.index ?? temp.length, 0, data);
        return temp;
      });
    } else {
      setTables((prev) => [
        ...prev,
        {
          id: nanoid(),
          name: `table_${prev.length}`,
          x: -transform.pan.x,
          y: -transform.pan.y,
          fields: [
            {
              name: "id",
              type: "INT",
              default: "",
              check: "",
              primary: true,
              unique: true,
              notNull: true,
              increment: true,
              comment: "",
              id: 0,
            },
          ],
          comment: "",
          indices: [],
          color: defaultBlue,
          key: Date.now(),
        },
      ]);
    }
    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.ADD,
          element: ObjectType.TABLE,
          message: `Add new table`,
        },
      ]);
      setRedoStack([]);
    }
  };

  const deleteTable = (id, addToHistory = true) => {
    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.DELETE,
          element: ObjectType.TABLE,
          data: tables[id],
          message: `Delete table`,
        },
      ]);
      setRedoStack([]);
    }
    setRelationships((prevR) => {
      return prevR
        .filter((e) => !(e.startTableId === id || e.endTableId === id))
        .map((e, i) => {
          const newR = { ...e };

          if (e.startTableId > id) {
            newR.startTableId = e.startTableId - 1;
          }
          if (e.endTableId > id) {
            newR.endTableId = e.endTableId - 1;
          }

          return { ...newR, id: i };
        });
    });
    setTables((prev) => {
      return prev.filter((e) => e.id !== id).map((e, i) => ({ ...e, id: i }));
    });
    if (isElementSelected(id)) {
      setSelectedElement(null);
    }
  };

  const updateTable = (id, updatedValues) => {
    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedValues } : t))
    );
  };

  const updateField = (tid, fid, updatedValues) => {
    setTables((prev) =>
      prev.map((table, i) => {
        if (tid === i) {
          return {
            ...table,
            fields: table.fields.map((field, j) =>
              fid === j ? { ...field, ...updatedValues } : field
            ),
          };
        }
        return table;
      })
    );
  };

  const deleteField = (field, tid) => {
    setUndoStack((prev) => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.TABLE,
        component: "field_delete",
        tid: tid,
        data: field,
        message: `Delete field`,
      },
    ]);
    setRedoStack([]);
    setRelationships((prev) =>
      prev
        .filter(
          (e) =>
            !(
              (e.startTableId === tid && e.startFieldId === field.id) ||
              (e.endTableId === tid && e.endFieldId === field.id)
            )
        )
        .map((e, i) => ({ ...e, id: i }))
    );
    setRelationships((prev) => {
      return prev.map((e) => {
        if (e.startTableId === tid && e.startFieldId > field.id) {
          return {
            ...e,
            startFieldId: e.startFieldId - 1,
          };
        }
        if (e.endTableId === tid && e.endFieldId > field.id) {
          return {
            ...e,
            endFieldId: e.endFieldId - 1,
          };
        }
        return e;
      });
    });
    updateTable(tid, {
      fields: tables[tid].fields
        .filter((e) => e.id !== field.id)
        .map((t, i) => {
          return { ...t, id: i };
        }),
    });
  };

  const addRelationship = (data, addToHistory = true) => {
    if (addToHistory) {
      setRelationships((prev) => {
        setUndoStack((prevUndo) => [
          ...prevUndo,
          {
            action: Action.ADD,
            element: ObjectType.RELATIONSHIP,
            data: data,
            message: `Add new relationship`,
          },
        ]);
        setRedoStack([]);
        return [...prev, data];
      });
    } else {
      setRelationships((prev) => {
        const temp = prev.slice();
        temp.splice(data.id, 0, data);
        return temp.map((t, i) => ({ ...t, id: i }));
      });
    }
  };

  const deleteRelationship = (id, addToHistory = true) => {
    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.DELETE,
          element: ObjectType.RELATIONSHIP,
          data: relationships[id],
          message: `Delete relationship`,
        },
      ]);
      setRedoStack([]);
    }
    setRelationships((prev) =>
      prev.filter((e) => e.id !== id).map((e, i) => ({ ...e, id: i }))
    );
  };

  const updateRelationships = (id, updatedValues) => {
    setRelationships((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedValues } : t))
    );
  }

  return (
    <TablesContext.Provider
      value={{
        tables,
        setTables,
        addTable,
        updateTable,
        updateField,
        deleteField,
        deleteTable,
        relationships,
        setRelationships,
        addRelationship,
        updateRelationships,
        deleteRelationship,
      }}
    >
      {children}
    </TablesContext.Provider>
  );
}
