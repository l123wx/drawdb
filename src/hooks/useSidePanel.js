import { useContext } from "react";
import { SidePanelContext } from "../context/SidePanelContext";

export default function useSidePanel() {
  return useContext(SidePanelContext);
}
