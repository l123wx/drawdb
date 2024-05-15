import { useEffect, useMemo, useState } from "react";
import {
  Action,
  ObjectType,
  State,
  noteThemes,
} from "../../data/constants";
import { Input, Button, Popover, Toast } from "@douyinfe/semi-ui";
import {
  IconEdit,
  IconDeleteStroked,
  IconCheckboxTick,
} from "@douyinfe/semi-icons";
import {
  useLayout,
  useUndoRedo,
  useCanvasElement,
  useNotes,
  useSaveState,
} from "../../hooks";
import { NoteCanvasElement } from '../../utils/CanvasElement'

export default function Note({ data, onMouseDown }) {
  const w = 180;
  const r = 3;
  const fold = 24;
  const [editField, setEditField] = useState({});
  const [hovered, setHovered] = useState(false);
  const [isPopoverShow, setIsPopoverShow] = useState(false);
  const { layout } = useLayout();
  const { setSaveState } = useSaveState();
  const { addNote, updateNote, deleteNote } = useNotes();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { selectedElement, setSelectedElement, isElementSelected, addElement, removeElementById } = useCanvasElement();

  const isNoteSelected = isElementSelected(data.id)

  const noteCanvasElement = useMemo(() => new NoteCanvasElement({
    id: data.id,
    data,
    openEditor() {
      console.log('note openEditor')
      if (layout.sidebar) {
        return
      }

      setIsPopoverShow(true)
    },
    comeIntoView() {
      console.log('note comeIntoView')
    },
    update(newData) {
      updateNote(data.id, newData)
    },
    delete() {
      deleteNote(data.id)
    },
    duplicate() {
      addNote({
        ...data,
        x: data.x + 20,
        y: data.y + 20
      });
    }
  }), [data, layout.sidebar, addNote, deleteNote, updateNote])

  useEffect(() => {
    addElement(noteCanvasElement)
    return () => {
      removeElementById(noteCanvasElement.id)
    }
  }, [])

  const handleChange = (e) => {
    const textarea = document.getElementById(`note_${data.id}`);
    textarea.style.height = "0";
    textarea.style.height = textarea.scrollHeight + "px";
    const newHeight = textarea.scrollHeight + 42;
    updateNote(data.id, { content: e.target.value, height: newHeight });
  };

  const handleBlur = (e) => {
    if (e.target.value === editField.content) return;
    const textarea = document.getElementById(`note_${data.id}`);
    textarea.style.height = "0";
    textarea.style.height = textarea.scrollHeight + "px";
    const newHeight = textarea.scrollHeight + 16 + 20 + 4;
    setUndoStack((prev) => [
      ...prev,
      {
        action: Action.EDIT,
        element: ObjectType.NOTE,
        nid: data.id,
        undo: editField,
        redo: { content: e.target.value, height: newHeight },
        message: `Edit note content to "${e.target.value}"`,
      },
    ]);
    setRedoStack([]);
  };

  const edit = () => {
    setSelectedElement(noteCanvasElement)
    selectedElement.showEditor()
    selectedElement.comeIntoView()

    // setSelectedElement((prev) => ({
    //   ...prev,
    //   ...(layout.sidebar && { currentTab: Tab.NOTES }),
    //   ...(!layout.sidebar && { element: ObjectType.NOTE }),
    //   id: data.id,
    //   open: true,
    // }));

    // if (layout.sidebar && selectedElement.currentTab === Tab.NOTES) {
    //   document
    //     .getElementById(`scroll_note_${data.id}`)
    //     .scrollIntoView({ behavior: "smooth" });
    // }
  };

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <path
        d={`M${data.x + fold} ${data.y} L${data.x + w - r} ${
          data.y
        } A${r} ${r} 0 0 1 ${data.x + w} ${data.y + r} L${data.x + w} ${
          data.y + data.height - r
        } A${r} ${r} 0 0 1 ${data.x + w - r} ${data.y + data.height} L${
          data.x + r
        } ${data.y + data.height} A${r} ${r} 0 0 1 ${data.x} ${
          data.y + data.height - r
        } L${data.x} ${data.y + fold}`}
        fill={data.color}
        stroke={
          hovered
            ? "rgb(59 130 246)"
            : isNoteSelected
              ? "rgb(59 130 246)"
              : "rgb(168 162 158)"
        }
        strokeDasharray={hovered ? 4 : 0}
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
      <path
        d={`M${data.x} ${data.y + fold} L${data.x + fold - r} ${
          data.y + fold
        } A${r} ${r} 0 0 0 ${data.x + fold} ${data.y + fold - r} L${
          data.x + fold
        } ${data.y} L${data.x} ${data.y + fold} Z`}
        fill={data.color}
        stroke={
          hovered
            ? "rgb(59 130 246)"
            : isNoteSelected
              ? "rgb(59 130 246)"
              : "rgb(168 162 158)"
        }
        strokeDasharray={hovered ? 4 : 0}
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
      <foreignObject
        x={data.x}
        y={data.y}
        width={w}
        height={data.height}
        onMouseDown={(e) => {
          onMouseDown(e, noteCanvasElement)
          setSelectedElement(noteCanvasElement)
        }}
      >
        <div className="text-gray-900 select-none w-full h-full cursor-move px-3 py-2">
          <div className="flex justify-between gap-1 w-full">
            <label
              htmlFor={`note_${data.id}`}
              className="ms-5 overflow-hidden text-ellipsis"
            >
              {data.title}
            </label>
            {(hovered ||
              (isNoteSelected &&
                selectedElement.open &&
                !layout.sidebar)) && (
              <div>
                <Popover
                  visible={isPopoverShow}
                  onClickOutSide={() => {
                    setIsPopoverShow(false)
                    setSaveState(State.SAVING);
                  }}
                  stopPropagation
                  content={
                    <div className="popover-theme">
                      <div className="font-semibold mb-2 ms-1">Edit note</div>
                      <div className="w-[280px] flex items-center mb-2">
                        <Input
                          value={data.title}
                          placeholder="Title"
                          className="me-2"
                          onChange={(value) =>
                            updateNote(data.id, { title: value })
                          }
                          onFocus={(e) =>
                            setEditField({ title: e.target.value })
                          }
                          onBlur={(e) => {
                            if (e.target.value === editField.title) return;
                            setUndoStack((prev) => [
                              ...prev,
                              {
                                action: Action.EDIT,
                                element: ObjectType.NOTE,
                                nid: data.id,
                                undo: editField,
                                redo: { title: e.target.value },
                                message: `Edit note title to "${e.target.value}"`,
                              },
                            ]);
                            setRedoStack([]);
                          }}
                        />
                        <Popover
                          content={
                            <div className="popover-theme">
                              <div className="font-medium mb-1">Theme</div>
                              <hr />
                              <div className="py-3">
                                {noteThemes.map((c) => (
                                  <button
                                    key={c}
                                    style={{ backgroundColor: c }}
                                    className="p-3 rounded-full mx-1"
                                    onClick={() => {
                                      setUndoStack((prev) => [
                                        ...prev,
                                        {
                                          action: Action.EDIT,
                                          element: ObjectType.NOTE,
                                          nid: data.id,
                                          undo: { color: data.color },
                                          redo: { color: c },
                                          message: `Edit note color to ${c}`,
                                        },
                                      ]);
                                      setRedoStack([]);
                                      updateNote(data.id, { color: c });
                                    }}
                                  >
                                    {data.color === c ? (
                                      <IconCheckboxTick
                                        style={{ color: "white" }}
                                      />
                                    ) : (
                                      <IconCheckboxTick style={{ color: c }} />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          }
                          position="rightTop"
                          showArrow
                        >
                          <div
                            className="h-[32px] w-[32px] rounded"
                            style={{ backgroundColor: data.color }}
                          />
                        </Popover>
                      </div>
                      <div className="flex">
                        <Button
                          icon={<IconDeleteStroked />}
                          type="danger"
                          block
                          onClick={() => {
                            Toast.success(`Note deleted!`);
                            deleteNote(data.id);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  }
                  trigger="custom"
                  position="rightTop"
                  showArrow
                >
                  <Button
                    icon={<IconEdit />}
                    size="small"
                    theme="solid"
                    style={{
                      backgroundColor: "#2F68ADB3",
                    }}
                    onClick={edit}
                  />
                </Popover>
              </div>
            )}
          </div>
          <textarea
            id={`note_${data.id}`}
            value={data.content}
            onChange={handleChange}
            onFocus={(e) =>
              setEditField({
                content: e.target.value,
                height: data.height,
              })
            }
            onBlur={handleBlur}
            className="w-full resize-none outline-none overflow-y-hidden border-none select-none"
            style={{ backgroundColor: data.color }}
          />
        </div>
      </foreignObject>
    </g>
  );
}
