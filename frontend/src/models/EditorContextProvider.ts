import { reactive, type Reactive } from "vue";
import EditorContext from "./EditorContext";

export default class EditorContextProvider {
  private static _context: Reactive<EditorContext>;

  static getContext() {
    if (!this._context) {
      this._context = reactive(new EditorContext());
    }
    return this._context;
  }

  static setContext(context: EditorContext) {
    this._context = reactive(context);
  }
}
