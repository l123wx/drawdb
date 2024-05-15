import { useState } from 'react'
import { Collapse, Row, Col, Button, Popover } from "@douyinfe/semi-ui";
import { IconPlus, IconInfoCircle } from "@douyinfe/semi-icons";
import { useCanvasElement, useTypes } from "../../../hooks";
import Searchbar from "./SearchBar";
import Empty from "../Empty";
import TypeInfo from "./TypeInfo";

export default function TypesTab() {
  const { types, addType } = useTypes();
  const { setSelectedElement, setSelectedElementById } = useCanvasElement();
  const [collapseActiveKeys, setCollapseActiveKeys] = useState([])

  return (
    <>
      <Row gutter={6}>
        <Col span={13}>
          <Searchbar />
        </Col>
        <Col span={8}>
          <Button icon={<IconPlus />} block onClick={() => addType()}>
            Add type
          </Button>
        </Col>
        <Col span={3}>
          <Popover
            content={
              <div className="w-[240px] text-sm space-y-2 popover-theme">
                <div>
                  This feature is meant for object-relational DBMSs like{" "}
                  <strong>PostgreSQL</strong>.
                </div>
                <div>
                  If used for <strong>MySQL</strong> or <strong>MariaDB</strong>{" "}
                  a <code>JSON</code> type will be generated with the
                  corresponding json validation check.
                </div>
                <div>
                  If used for <strong>SQLite</strong> it will be translated to a{" "}
                  <code>BLOB</code>.
                </div>
                <div>
                  If used for <strong>MSSQL</strong> a type alias to the first
                  field will be generated.
                </div>
              </div>
            }
            showArrow
            position="rightTop"
          >
            <Button theme="borderless" icon={<IconInfoCircle />} />
          </Popover>
        </Col>
      </Row>
      {types.length <= 0 ? (
        <Empty title="No types" text="Make your own custom data types" />
      ) : (
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
            {types.map((t, i) => (
              <TypeInfo data={t} key={i} index={i} />
            ))}
        </Collapse>
      )}
    </>
  );
}
