import { useState } from 'react'
import { Collapse } from "@douyinfe/semi-ui";
import { useCanvasElement, useTables } from "../../../hooks";
import Empty from "../Empty";
import SearchBar from "./SearchBar";
import RelationshipInfo from "./RelationshipInfo";

export default function RelationshipsTab() {
  const { relationships } = useTables();
  const { setSelectedElement, setSelectedElementById } = useCanvasElement();
  const [collapseActiveKeys, setCollapseActiveKeys] = useState([])

  return (
    <>
      <SearchBar />
      <Collapse
        activeKey={collapseActiveKeys}
        keepDOM
        lazyRender
        onChange={(activeKeys) => {
          setCollapseActiveKeys(activeKeys)
          activeKeys[0] ? setSelectedElementById(activeKeys[0]) : setSelectedElement(null)
        }}
        accordion
      >
        {relationships.length <= 0 ? (
          <Empty
            title="No relationships"
            text="Drag to connect fields and form relationships!"
          />
        ) : (
          relationships.map((r) => <RelationshipInfo key={r.id} data={r} />)
        )}
      </Collapse>
    </>
  );
}
