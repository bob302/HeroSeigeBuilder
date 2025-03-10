import { Cell, type CellStyle } from "./Cell";
import { Slot } from "./Slot";
import { BaseItem, getEquipmentTypeBySubtype, type EquipmentSubtype } from "./Equipment";
import { Point2D } from "./Point2D";
import { Item } from "./Item";
import { EquipmentType } from "../util/Enums";

export interface SlotConfig {
  classes: string[];
  slotName: string;
  hasItem: boolean;
  hasClick: boolean;
  style: CellStyle;
  restrictions?: Set<EquipmentSubtype | EquipmentType>
}

export class EquipmentSlot {
  public cell: Cell;
  public slot: Slot;
  public style: CellStyle;
  public slotName: string;
  private restrictions: Set<EquipmentSubtype | EquipmentType> = new Set();
  isBlacklist: boolean = false; 

  constructor(style: CellStyle, slotName: string) {
    this.slotName = slotName;
    this.cell = new Cell(new Point2D(1, 1));
    this.slot = new Slot();
    this.style = style;
    this.initialize();
  }

  putItemInSlot(item: BaseItem) {
    this.slot.item = new Item(item)
  }

  private initialize() {
    this.cell.setCellStyle(this.style);
    if (this.style.background) {
      this.cell.getCellStyle().background = this.style.background;
    }
    this.slot.item = null;
  }

  clear(): void {
    this.slot.item = null;
  }

  isRestricted(type?: EquipmentType, subtype?: EquipmentSubtype): boolean {
    // If restrictions are empty, return false (no restrictions)
       
    if (this.restrictions.size === 0) {
      return false;
    }
  
    // If no type or subtype is provided, return false (nothing to check)
    if (!type && !subtype) {
      return false;
    }
  
    // If type is missing but subtype is provided, attempt to deduce type
    if (!type && subtype) {
      type = getEquipmentTypeBySubtype(subtype);
    }
  
    // Check if restrictions include the equipment type
    if (type && this.restrictions.has(type)) {
      return this.isBlacklist; // If in blacklist mode, block the type, otherwise allow
    }
  
    // Check if restrictions include the equipment subtype
    if (subtype && this.restrictions.has(subtype)) {
      return this.isBlacklist; // If in blacklist mode, block the subtype, otherwise allow
    }
  
    // If neither the type nor the subtype is restricted, return false (or !this.isBlacklist)
    return !this.isBlacklist;
  }
  
  
  
  getRestrictions() {
    return this.restrictions
  }

  async setRestrictions(restrictions: Set<EquipmentSubtype | EquipmentType>, isBlacklist: boolean = false) {
    this.restrictions.clear();
    restrictions.forEach(restriction => this.restrictions.add(restriction));
    this.isBlacklist = isBlacklist;
  }

  serialize() {
    return {
      slot: this.slot.serialize(),
      slotName: this.slotName,
    };
  }

  static async deserialize(data: any): Promise<EquipmentSlot> {
    const equipment =
      data.data &&
      typeof data.data === "object" &&
      typeof (data.data as any).deserialize === "function"
        ? (data.data as any).deserialize(data.data)
        : data.data;

    const slotConfig = EquipmentSlot.getslotsConfig().find(
      (config) => config.slotName === data.slotName,
    );

    if (!slotConfig) {
      throw new Error(`Не найден конфиг для слота: ${data.slotName}`);
    }


    const slot = new EquipmentSlot(slotConfig.style, data.slotName);

    if (equipment) {
      slot.putItemInSlot(equipment)
    }

    if (slotConfig.restrictions && slotConfig.restrictions?.size > 0) {
      slot.setRestrictions(slotConfig.restrictions)
    }

    slot.cell = new Cell(new Point2D(1, 1));
    slot.cell.setCellStyle(slotConfig.style);
    slot.slot = await Slot.deserialize(data.slot);

    return slot;
  }

  static editorSlotConfig(): SlotConfig {
    return {
      classes: ["editor-slot"],
      slotName: "editor",
      hasItem: true,
      hasClick: true,
      style: {
        border: "8px solid",
        borderImage: "",
        background: "/img/equipment-slot/slot-editor.png",
      },
      restrictions: new Set([])
    }
  }

  static getslotsConfig(): SlotConfig[] {
    return [
      {
        classes: ["slot-item", "helm"],
        slotName: "helm",
        hasItem: true,
        hasClick: true,
        style: {
          border: "8px solid",
          borderImage: "",
          background: "/img/equipment-slot/slot-helm.png",
        },
        restrictions: new Set(['Helmet'])
      },
      {
        classes: ["slot-item", "amulet"],
        slotName: "amulet",
        hasItem: true,
        hasClick: true,
        style: {
          border: "8px solid",
          borderImage: "",
          background: "/img/equipment-slot/slot-amulet.png",
        },
        restrictions: new Set(['Amulet'])
      },
      {
        classes: ["slot-item", "weapon"],
        slotName: "weapon",
        hasItem: true,
        hasClick: true,
        style: {
          border: "8px solid",
          borderImage: "",
          background: "/img/equipment-slot/slot-weapon.png",
        },
        restrictions: new Set([EquipmentType.Weapon])
      },
      {
        classes: ["slot-item", "body-armour"],
        slotName: "bodyArmour",
        hasItem: true,
        hasClick: true,
        style: {
          border: "8px solid",
          borderImage: "",
          background: "/img/equipment-slot/slot-body.png",
        },
        restrictions: new Set(['Body Armor'])
      },
      {
        classes: ["slot-item", "offhand"],
        slotName: "offhand",
        hasItem: true,
        hasClick: true,
        style: {
          border: "8px solid",
          borderImage: "",
          background: "/img/equipment-slot/slot-offhand.png",
        },
        restrictions: new Set([EquipmentType.Offhand])
      },
      {
        classes: ["slot-item", "ring"],
        slotName: "ringLeft",
        hasItem: true,
        hasClick: true,
        style: {
          border: "8px solid",
          borderImage: "",
          background: "/img/equipment-slot/slot-ring.png",
        },
        restrictions: new Set(['Ring'])
      },
      {
        classes: ["slot-item", "belt"],
        slotName: "belt",
        hasItem: true,
        hasClick: true,
        style: {
          border: "8px solid",
          borderImage: "",
          background: "/img/equipment-slot/slot-belt.png",
        },
        restrictions: new Set(['Belt'])

      },
      {
        classes: ["slot-item", "ring2"],
        slotName: "ringRight",
        hasItem: true,
        hasClick: true,
        style: {
          border: "8px solid",
          borderImage: "",
          background: "/img/equipment-slot/slot-ring.png",
        },
        restrictions: new Set(['Ring'])

      },
      {
        classes: ["slot-item", "gloves"],
        slotName: "gloves",
        hasItem: true,
        hasClick: true,
        style: {
          border: "8px solid",
          borderImage: "",
          background: "/img/equipment-slot/slot-gloves.png",
        },
        restrictions: new Set(['Gloves'])
      },
      {
        classes: ["slot-item", "boots"],
        slotName: "boots",
        hasItem: true,
        hasClick: true,
        style: {
          border: "8px solid",
          borderImage: "",
          background: "/img/equipment-slot/slot-boots.png",
        },
        restrictions: new Set(['Boots'])
      },
      {
        classes: ["slot-item", "flask", "flask1"],
        slotName: "flask1",
        hasItem: true,
        hasClick: true,
        style: {
          border: "8px solid",
          borderImage: "",
          background: "/img/equipment-slot/slot-flask.png",
        },
        restrictions: new Set(['Potion'])
      },
      {
        classes: ["slot-item", "flask", "flask2"],
        slotName: "flask2",
        hasItem: true,
        hasClick: true,
        style: {
          border: "8px solid",
          borderImage: "",
          background: "/img/equipment-slot/slot-flask.png",
        },
        restrictions: new Set(['Potion'])
      },
      {
        classes: ["slot-item", "flask", "flask3"],
        slotName: "flask3",
        hasItem: true,
        hasClick: true,
        style: {
          border: "8px solid",
          borderImage: "",
          background: "/img/equipment-slot/slot-flask.png",
        },
        restrictions: new Set(['Potion'])
      },
      {
        classes: ["slot-item", "flask", "flask4"],
        slotName: "flask4",
        hasItem: true,
        hasClick: true,
        style: {
          border: "8px solid",
          borderImage: "",
          background: "/img/equipment-slot/slot-flask.png",
        },
        restrictions: new Set(['Potion'])
      },
      {
        classes: ["slot-item", "relic", "relic1"],
        slotName: "relic1",
        hasItem: true,
        hasClick: true,
        style: {
          border: "8px solid",
          borderImage: "",
          background: "/img/equipment-slot/slot-relic.png",
        },
        restrictions: new Set(['Relic'])
      },
      {
        classes: ["slot-item", "relic", "relic2"],
        slotName: "relic2",
        hasItem: true,
        hasClick: true,
        style: {
          border: "8px solid",
          borderImage: "",
          background: "/img/equipment-slot/slot-relic.png",
        },
        restrictions: new Set(['Relic'])
      },
      {
        classes: ["slot-item", "relic", "relic3"],
        slotName: "relic3",
        hasItem: true,
        hasClick: true,
        style: {
          border: "8px solid",
          borderImage: "",
          background: "/img/equipment-slot/slot-relic.png",
        },
        restrictions: new Set(['Relic'])
      },
      {
        classes: ["slot-item", "relic", "relic4"],
        slotName: "relic4",
        hasItem: true,
        hasClick: true,
        style: {
          border: "8px solid",
          borderImage: "",
          background: "/img/equipment-slot/slot-relic.png",
        },
        restrictions: new Set(['Relic'])
      },
      {
        classes: ["slot-item", "relic", "relic5"],
        slotName: "relic5",
        hasItem: true,
        hasClick: true,
        style: {
          border: "8px solid",
          borderImage: "",
          background: "/img/equipment-slot/slot-relic.png",
        },
        restrictions: new Set(['Relic'])
      },
    ];
  }
}
