import LayoutContextProvider from "../context/LayoutContext";
import TransformContextProvider from "../context/TransformContext";
import TablesContextProvider from "../context/TablesContext";
import UndoRedoContextProvider from "../context/UndoRedoContext";
import CanvasElementContextProvider from "../context/CanvasElementContext";
import SidePanelContextProvider from "../context/SidePanelContext";
import AreasContextProvider from "../context/AreasContext";
import NotesContextProvider from "../context/NotesContext";
import TypesContextProvider from "../context/TypesContext";
import TasksContextProvider from "../context/TasksContext";
import SaveStateContextProvider from "../context/SaveStateContext";
import WorkSpace from "../components/Workspace";

export default function Editor() {
  return (
    <LayoutContextProvider>
      <TransformContextProvider>
        <UndoRedoContextProvider>
          <CanvasElementContextProvider>
            <SidePanelContextProvider>
              <TasksContextProvider>
                <AreasContextProvider>
                  <NotesContextProvider>
                    <TypesContextProvider>
                      <TablesContextProvider>
                        <SaveStateContextProvider>
                          <WorkSpace />
                        </SaveStateContextProvider>
                      </TablesContextProvider>
                    </TypesContextProvider>
                  </NotesContextProvider>
                </AreasContextProvider>
              </TasksContextProvider>
            </SidePanelContextProvider>
          </CanvasElementContextProvider>
        </UndoRedoContextProvider>
      </TransformContextProvider>
    </LayoutContextProvider>
  );
}
