import GameContext from "./GameContext";

export class GameContextProvider {
  private static instance: GameContext;

  static getContext(): GameContext {
    if (!this.instance) {
      this.instance = new GameContext();
    }
    return this.instance;
  }
}