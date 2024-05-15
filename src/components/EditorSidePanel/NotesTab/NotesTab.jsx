import { useState } from 'react'
import { Row, Col, Button, Collapse } from "@douyinfe/semi-ui";
import { IconPlus } from "@douyinfe/semi-icons";
import { useNotes, useCanvasElement } from "../../../hooks";
import Empty from "../Empty";
import SearchBar from "./SearchBar";
import NoteInfo from "./NoteInfo";

export default function NotesTab() {
  const { notes, addNote } = useNotes();
  const { setSelectedElement, setSelectedElementById } = useCanvasElement();
  const [collapseActiveKeys, setCollapseActiveKeys] = useState([])

  return (
    <>
      <Row gutter={6}>
        <Col span={16}>
          <SearchBar
            setActiveKey={(activeKey) =>
              setSelectedElement((prev) => ({
                ...prev,
                id: parseInt(activeKey),
              }))
            }
          />
        </Col>
        <Col span={8}>
          <Button icon={<IconPlus />} block onClick={() => addNote()}>
            Add note
          </Button>
        </Col>
      </Row>
      {notes.length <= 0 ? (
        <Empty title="No text notes" text="Add notes cuz why not!" />
      ) : (
        <Collapse
          activeKey={collapseActiveKeys}
          keepDOM
          lazyRender
          onChange={(activeKeys) => {
            console.log('%c [ activeKeys ]-41', 'font-size:13px; background:pink; color:#bf2c9f;', activeKeys)
            setCollapseActiveKeys(activeKeys)
            activeKeys[0] ? setSelectedElementById(activeKeys[0]) : setSelectedElement(null)
          }}
            accordion
          >
          {notes.map((n, i) => (
            <NoteInfo data={n} key={i} nid={i} />
          ))}
        </Collapse>
      )}
    </>
  );
}
