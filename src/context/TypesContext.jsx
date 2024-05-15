import { createContext, useState } from "react";
import { nanoid } from 'nanoid';
import { Action, ObjectType } from "../data/constants";
import useUndoRedo from "../hooks/useUndoRedo";

export const TypesContext = createContext(null);

export default function TypesContextProvider({ children }) {
  const [types, setTypes] = useState([]);
  const { setUndoStack, setRedoStack } = useUndoRedo();

  const addType = (data, addToHistory = true) => {
    if (data) {
      setTypes((prev) => {
        data.id = nanoid()
        data.key = Date.now()

        const temp = prev.slice();
        temp.splice(data.index ?? temp.length, 0, data);
        return temp;
      });
    } else {
      setTypes((prev) => [
        ...prev,
        {
          id: nanoid(),
          name: `type_${prev.length}`,
          fields: [],
          comment: "",
        },
      ]);
    }
    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.ADD,
          element: ObjectType.TYPE,
          message: `Add new type`,
        },
      ]);
      setRedoStack([]);
    }
  };

  const deleteType = (id, addToHistory = true) => {
    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.DELETE,
          element: ObjectType.TYPE,
          id: id,
          data: types[id],
          message: `Delete type`,
        },
      ]);
      setRedoStack([]);
    }
    setTypes((prev) => prev.filter((e, i) => i !== id));
  };

  const updateType = (id, values) => {
    setTypes((prev) =>
      prev.map((e, i) => (i === id ? { ...e, ...values } : e))
    );
  };

  return (
    <TypesContext.Provider
      value={{
        types,
        setTypes,
        addType,
        updateType,
        deleteType,
      }}
    >
      {children}
    </TypesContext.Provider>
  );
}
