import { createContext, useState } from "react";
import _ from 'lodash-es'

export const CanvasElementContext = createContext(null);

const canvasElementMap = new Map()

export default function CanvasElementContextProvider({ children }) {
  const [selectedElement, setSelectedElement] = useState();
  // {
  //   element: ObjectType.NONE,
  //   id: -1,
  //   openDialogue: false,
  //   openCollapse: false,
  //   currentTab: Tab.TABLES,
  //   open: false, // open popover or sidesheet when sidebar is disabled
  //   openFromToolbar: false, // this is to handle triggering onClickOutside when sidebar is disabled
  //   comeIntoView: false, // Brings the selected element into view
  // }

  const isElementSelected = (id) => {
    if (_.isNil(id)) {
      throw new Error('The argument id is required')
    }

    return selectedElement?.id === id
  }

  const addElement = (canvasElement) => {
    canvasElementMap.set(canvasElement.id, canvasElement)
  }

  const getElementById = (id) => {
    return canvasElementMap.get(id)
  }

  const removeElementById = (id) => {
    canvasElementMap.delete(id)
  }
  
  const setSelectedElementById = (id) => {
    const element = getElementById(id)

    if (!element) throw new Error('Cannot find canvasElement with Id ' + id)

    setSelectedElement(getElementById(id))
  }

  return (
    <CanvasElementContext.Provider value={{
      selectedElement,
      isElementSelected,
      setSelectedElement,
      addElement,
      getElementById,
      removeElementById,
      setSelectedElementById
    }}>
      {children}
    </CanvasElementContext.Provider>
  );
}
