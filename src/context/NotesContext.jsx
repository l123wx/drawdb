import { createContext, useState } from "react";
import { nanoid } from 'nanoid';
import { useTransform, useUndoRedo, useCanvasElement } from "../hooks";
import { Action, ObjectType, defaultNoteTheme } from "../data/constants";

export const NotesContext = createContext(null);

export default function NotesContextProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const { transform } = useTransform();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { setSelectedElement, isElementSelected } = useCanvasElement();

  const addNote = (data, addToHistory = true) => {
    if (data) {
      setNotes((prev) => {
        data.id = nanoid()
        data.key = Date.now()

        const temp = prev.slice();
        temp.splice(data.index ?? temp.length, 0, data);
        return temp;
      });
    } else {
      setNotes((prev) => [
        ...prev,
        {
          id: nanoid(),
          x: -transform.pan.x,
          y: -transform.pan.y,
          title: `note_${prev.length}`,
          content: "",
          color: defaultNoteTheme,
          height: 88,
        },
      ]);
    }
    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.ADD,
          element: ObjectType.NOTE,
          message: `Add new note`,
        },
      ]);
      setRedoStack([]);
    }
  };

  const deleteNote = (id, addToHistory = true) => {
    if (addToHistory) {
      setUndoStack((prev) => [
        ...prev,
        {
          action: Action.DELETE,
          element: ObjectType.NOTE,
          data: notes[id],
          message: `Delete note`,
        },
      ]);
      setRedoStack([]);
    }
    setNotes((prev) =>
      prev.filter((e) => e.id !== id).map((e, i) => ({ ...e, id: i }))
    );
    if (isElementSelected(id)) {
      setSelectedElement(null);
    }
  };

  const updateNote = (id, values) => {
    setNotes((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            ...values,
          };
        }
        return t;
      })
    );
  };

  return (
    <NotesContext.Provider
      value={{ notes, setNotes, updateNote, addNote, deleteNote }}
    >
      {children}
    </NotesContext.Provider>
  );
}
