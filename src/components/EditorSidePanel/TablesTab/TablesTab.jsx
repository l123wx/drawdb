import { useState } from 'react'
import { Collapse, Row, Col, Button } from "@douyinfe/semi-ui";
import { IconPlus } from "@douyinfe/semi-icons";
import { useCanvasElement, useTables } from "../../../hooks";
import SearchBar from "./SearchBar";
import Empty from "../Empty";
import TableInfo from "./TableInfo";

export default function TablesTab() {
  const { tables, addTable } = useTables();
  const { setSelectedElementById, setSelectedElement } = useCanvasElement();
  const [collapseActiveKeys, setCollapseActiveKeys] = useState([])

  return (
    <>
      <Row gutter={6}>
        <Col span={16}>
          <SearchBar tables={tables} />
        </Col>
        <Col span={8}>
          <Button icon={<IconPlus />} block onClick={() => addTable()}>
            Add table
          </Button>
        </Col>
      </Row>
      {tables.length === 0 ? (
        <Empty title="No tables" text="Start building your diagram!" />
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
          {tables.map((t) => (
            <div id={`scroll_table_${t.id}`} key={t.id}>
              <Collapse.Panel
                header={
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {t.name}
                  </div>
                }
                itemKey={`${t.id}`}
              >
                { console.time(123) }
                  <TableInfo data={t} />
                { console.timeEnd(123) }
              </Collapse.Panel>
            </div>
          ))}
        </Collapse>
      )}
    </>
  );
}
