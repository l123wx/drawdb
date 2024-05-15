import { useState } from "react";
import classnames from 'classnames'
import { Select, Highlight } from "@douyinfe/semi-ui";
import { IconSearch } from "@douyinfe/semi-icons";
import { useCanvasElement } from "../../../hooks";
import { ObjectType } from "../../../data/constants";

export default function SearchBar({ tables }) {
  const { setSelectedElement } = useCanvasElement();
  const [searchText, setSearchText] = useState("");
  const [optionsList, setoptionsList] = useState([]);

  const renderOptionItem = renderProps => {
    const {
      disabled,
      selected,
      label,
      focused,
      style,
      onMouseEnter,
      onClick,
    } = renderProps;
    const optionCls = classnames({
      ['semi-select-option']: true,
      ['semi-select-option-focused']: focused,
      ['semi-select-option-disabled']: disabled,
      ['semi-select-option-selected']: selected,
    });
    const searchWords = [searchText];

    // Notice：
    // 1.props传入的style需在wrapper dom上进行消费，否则在虚拟化场景下会无法正常使用
    // 2.选中(selected)、聚焦(focused)、禁用(disabled)等状态的样式需自行加上，你可以从props中获取到相对的boolean值
    // 3.onMouseEnter需在wrapper dom上绑定，否则上下键盘操作时显示会有问题

    return (
      <div
        style={style}
        className={optionCls}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        title={label}
      >
        <div className="truncate">
          <Highlight sourceString={label} searchWords={searchWords} />
        </div>
      </div>
    );
  };

  const handleSelectFocus = () => {
    setoptionsList(tables.reduce((resultList, table) => {
      resultList.push(
        {
          label: table.name,
          value: table.name,
          type: ObjectType.TABLE,
          tableId: table.id,
        },
        ...table.fields.map(field => ({
          label: `${table.name} > ${field.name}`,
          value: `${table.name} > ${field.name}`,
          type: ObjectType.FIELD,
          tableId: table.id,
          fieldId: field.id,
        }))
      )
      return resultList
    }, []))
  }

  return (
    <Select
      className="w-full"
      prefix={<IconSearch />}
      placeholder="Search..."
      optionList={optionsList}
      emptyContent={<div className="p-3 popover-theme">No tables found</div>}
      virtualize={{
        height: 270,
        width: '100%',
        itemSize: 40,
      }}
      filter
      preventScroll
      showClear
      onChangeWithObject
      renderOptionItem={renderOptionItem}
      onFocus={handleSelectFocus}
      onSearch={t => setSearchText(t)}
      onSelect={(v, option) => {
        setSelectedElement((prev) => ({
          ...prev,
          id: option.tableId,
          open: true,
          element: ObjectType.TABLE,
        }));

        // setTimeout(() => {
        //   document
        //     .getElementById(`scroll_table_${option.tableId}_field_${option.fieldId}`).scrollIntoView({ behavior: "smooth" });
        // }, 1000)
      }}
    ></Select>
  );
}
