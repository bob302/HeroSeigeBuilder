// models/EquipmentSlot.ts
import { Cell, type CellStyle, HightLightCellState } from './Cell';
import { Slot } from './Slot';
import { BaseItem, Equipment } from './Equipment';
import { Point2D } from './Point2D';
import { Item } from './Item';

export interface SlotConfig {
  classes: string[],
  slotName: string;
  hasItem: boolean;
  hasClick: boolean;
  style: CellStyle
}

export class EquipmentSlot {
  public cell: Cell;
  public slot: Slot;
  public style: CellStyle;
  public equipment: BaseItem
  public slotName: string

  constructor(
    equipment: BaseItem,
    style: CellStyle, slotName: string) {
      this.slotName = slotName
      this.cell = new Cell(new Point2D(1, 1));
      this.slot = new Slot(new Item(equipment, new Point2D(1, 1)));
      this.style = style;
      this.equipment = equipment
      this.initialize();
  }

  private initialize() {
    this.cell.setCellStyle(this.style);
    if (this.style.background) {
      this.cell.getCellStyle().background = this.style.background;
    }
    this.slot.item = null;
  }

  serialize() {
    return {
      slot: this.slot.serialize(),
      slotName: this.slotName
    };
  }

  static deserialize(data: any): EquipmentSlot {
    const equipment = data.data && typeof data.data === "object" &&
      typeof (data.data as any).deserialize === "function"
      ? (data.data as any).deserialize(data.data)
      : data.data;
    
    const slotConfig = EquipmentSlot.getslotsConfig().find(config => config.slotName === data.slotName);
    
    if (!slotConfig) {
      throw new Error(`Не найден конфиг для слота: ${data.slotName}`);
    }

    const slot = new EquipmentSlot(equipment, slotConfig.style, data.slotName);

    
    slot.cell = new Cell(new Point2D(1, 1));
    slot.cell.setCellStyle(slotConfig.style)
    slot.slot = Slot.deserialize(data.slot);
    
    return slot;
  }

  static getslotsConfig(): SlotConfig[] { 
    return [
    { classes: ['slot-item', 'helm'], slotName: 'helm', hasItem: true, hasClick: true, 
      style: {width: '6.7rem', height: '6.7rem', border: '8px solid', isEdge: false, borderImage:'', background: '/img/editor/slot-helm.JPEG'} }, 
    { classes: ['slot-item', 'amulet'], slotName: 'amulet', hasItem: true, hasClick: true, 
      style: {width: '3.52rem', height: '3.84rem', border: '8px solid', isEdge: false, borderImage:'', background: '/img/editor/slot-amulet.JPEG'} },
    { classes: ['slot-item', 'weapon'], slotName: 'weapon', hasItem: true, hasClick: true, 
      style: {width: '10rem', height: '15rem', border: '8px solid', isEdge: false, borderImage:'', background: '/img/editor/slot-weapon.JPEG'} },
    { classes: ['slot-item', 'body-armour'],  slotName: 'bodyArmour', hasItem: true, hasClick: true, 
      style: {width: '6.7rem', height: '11.3rem', border: '8px solid', isEdge: false, borderImage:'', background: '/img/editor/slot-body.JPEG'} },
    { classes: ['slot-item', 'offhand'],  slotName: 'offhand', hasItem: true, hasClick: true, 
      style: {width: '10rem', height: '15rem', border: '8px solid', isEdge: false, borderImage:'', background: '/img/editor/slot-offhand.JPEG'} },
    { classes: ['slot-item', 'ring'],  slotName: 'ringLeft', hasItem: true, hasClick: true, 
      style: {width: '3.52rem', height: '3.84rem', border: '8px solid', isEdge: false, borderImage:'', background: '/img/editor/slot-ring.JPEG'} },
    { classes: ['slot-item', 'belt'],  slotName: 'belt', hasItem: true, hasClick: true, 
      style: {width: '6.7rem', height: '3.84rem', border: '8px solid', isEdge: false, borderImage:'', background: '/img/editor/slot-belt.JPEG'} },
    { classes: ['slot-item', 'ring2'], slotName: 'ringRight', hasItem: true, hasClick: true, 
      style: {width: '3.52rem', height: '3.84rem', border: '8px solid', isEdge: false, borderImage:'', background: '/img/editor/slot-ring.JPEG'} },
    { classes: ['slot-item', 'gloves'],  slotName: 'gloves', hasItem: true, hasClick: true, 
      style: {width: '6.7rem', height: '6.7rem', border: '8px solid', isEdge: false, borderImage:'', background: '/img/editor/slot-gloves.JPEG'} },
    { classes: ['slot-item', 'boots'], slotName: 'boots', hasItem: true, hasClick: true, 
      style: {width: '6.7rem', height: '6.7rem', border: '8px solid', isEdge: false, borderImage:'', background: '/img/editor/slot-boots.JPEG'} },
    { classes: ['slot-item', 'flask', 'flask1'], slotName: 'flask1', hasItem: true, hasClick: true, 
      style: {width: '3.2rem', height: '7.2rem', border: '8px solid', isEdge: false, borderImage:'', background: '/img/editor/slot-flask.JPEG'} },
    { classes: ['slot-item', 'flask', 'flask2'], slotName: 'flask2', hasItem: true, hasClick: true, 
      style: {width: '3.2rem', height: '7.2rem', border: '8px solid', isEdge: false, borderImage:'', background: '/img/editor/slot-flask.JPEG'} },
    { classes: ['slot-item', 'flask', 'flask3'], slotName: 'flask3', hasItem: true, hasClick: true, 
      style: {width: '3.2rem', height: '7.2rem', border: '8px solid', isEdge: false, borderImage:'', background: '/img/editor/slot-flask.JPEG'} },
    { classes: ['slot-item', 'flask', 'flask4'], slotName: 'flask4', hasItem: true, hasClick: true, 
      style: {width: '3.2rem', height: '7.2rem', border: '8px solid', isEdge: false, borderImage:'', background: '/img/editor/slot-flask.JPEG'} },
    { classes: ['slot-item', 'relic', 'relic1'],  slotName: 'relic1', hasItem: true, hasClick: true, 
      style: {width: '3.52rem', height: '3.84rem', border: '8px solid', isEdge: false, borderImage:'', background: '/img/editor/slot-relic.JPEG'} },
    { classes: ['slot-item', 'relic', 'relic2'],  slotName: 'relic2', hasItem: true, hasClick: true, 
      style: {width: '3.52rem', height: '3.84rem', border: '8px solid', isEdge: false, borderImage:'', background: '/img/editor/slot-relic.JPEG'} },
    { classes: ['slot-item', 'relic', 'relic3'],  slotName: 'relic3', hasItem: true, hasClick: true, 
      style: {width: '3.52rem', height: '3.84rem', border: '8px solid', isEdge: false, borderImage:'', background: '/img/editor/slot-relic.JPEG'} },
    { classes: ['slot-item', 'relic', 'relic4'],  slotName: 'relic4', hasItem: true, hasClick: true, 
      style: {width: '3.52rem', height: '3.84rem', border: '8px solid', isEdge: false, borderImage:'', background: '/img/editor/slot-relic.JPEG'} },
    { classes: ['slot-item', 'relic', 'relic5'],  slotName: 'relic5', hasItem: true, hasClick: true, 
      style: {width: '3.52rem', height: '3.84rem', border: '8px solid', isEdge: false, borderImage:'', background: '/img/editor/slot-relic.JPEG'} },
  ]
}
}