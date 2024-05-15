import _ from 'lodash-es'
import { ObjectType } from "../data/constants";

export default class CanvasElement {
  static id
  static type
  static data
  
  static canDuplicate = false

  constructor(args) {
    if (new.target === CanvasElement) {
      throw new Error("Cannot instantiate abstract class");
    }

    if (_.isNil(args.id)) {
      throw new Error("Miss Required argument 'id'");
    }
    this.id = args.id

    if (!args.type) {
      throw new Error("Miss Required argument 'type'");
    }
    this.type = args.type

    if (!args.data) {
      throw new Error("Miss Required argument 'data'");
    }
    this.data = args.data

    if (!args.comeIntoView) {
      throw new Error("Miss Required argument 'comeIntoView'");
    }
    this.comeIntoView = args.comeIntoView

    if (!args.openEditor) {
      throw new Error("Miss Required argument 'openEditor'");
    }
    this.openEditor = args.openEditor

    if (!args.update) {
      throw new Error("Miss Required argument 'update'");
    }
    this.update = args.update

    if (!args.delete) {
      throw new Error("Miss Required argument 'delete'");
    }
    this.delete = args.delete
    
    if (args.duplicate) {
      this.duplicate = args.duplicate
      this.canDuplicate = true
    }
  }

  isSelected(id) {
    return this.id === id
  }
  comeIntoView() {
    throw new Error("Method 'comeIntoView' must be implemented");
  }
  openEditor() {
    throw new Error("Method 'openEditor' must be implemented");
  }
  update() {
    throw new Error("Method 'update' must be implemented");
  }
  duplicate() {
    throw new Error("Method 'duplicate' must be implemented");
  }
  delete() {
    throw new Error("Method 'delete' must be implemented");
  }
  copy() {
    return navigator.clipboard.writeText(JSON.stringify({ ...this.data }))
  }
  // openSideBar() {
  //   throw new Error("Method 'openSideBar' must be implemented");
  // }
  // openPopover() {
  //   throw new Error("Method 'openPopover' must be implemented");
  // }
  // openSideSheet() {
  //   throw new Error("Method 'openSideSheet' must be implemented");
  // }
}


export class TableCanvasElement extends CanvasElement {
  constructor(args) {
    super({
      ...args,
      type: ObjectType.TABLE
    })
  }
}

export class AreaCanvasElement extends CanvasElement {
  constructor(args) {
    super({
      ...args,
      type: ObjectType.AREA
    })
  }
}

export class NoteCanvasElement extends CanvasElement {
  constructor(args) {
    super({
      ...args,
      type: ObjectType.NOTE
    })
  }
}

export class RelationshipCanvasElement extends CanvasElement {
  constructor(args) {
    super({
      ...args,
      type: ObjectType.RELATIONSHIP
    })
  }
}