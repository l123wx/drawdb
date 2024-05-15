import { createContext, useState } from "react";
import { Tab } from "../data/constants";

export const SidePanelContext = createContext(null);

export default function SidePanelContextProvider({ children }) {
  const [currentTab, setCurrentTab] = useState(Tab.TABLES);

  return (
    <SidePanelContext.Provider value={{ currentTab, setCurrentTab }}>
      {children}
    </SidePanelContext.Provider>
  );
}
