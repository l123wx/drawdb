import { useContext } from "react";
import { CanvasElementContext } from "../context/CanvasElementContext";

export default function useCanvasElement() {
  return useContext(CanvasElementContext);
}
