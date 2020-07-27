import React from "react";
import { action, observable } from "mobx";
import { STAGE, CELL_ALIVE } from "./constant";
import { Modal } from "antd";
//https://juejin.im/post/5d491c0b6fb9a06b0b1c5cd1
class Store {
  @observable turn = 0;
  @observable debug = false;
  @observable board0 = this.initBoard();
  @observable board1 = this.initBoard();
  @observable stage = STAGE.NOT_START;
  @observable aiEmotion = false;

  initBoard = () => {
    const board = [];
    for (let i = 0; i < 10; i++) {
      const row = [];
      for (let j = 0; j < 10; j++) {
        row.push(0);
      }
      board.push(row);
    }
    return board;
  };

  allDestroyed = (board) =>
    board.every((row) => row.every((e) => e !== CELL_ALIVE));

  whoWin = () => {
    if (this.allDestroyed(this.board0)) return 1;
    if (this.allDestroyed(this.board1)) return 0;
    return -1;
  };

  @action.bound
  setTurn(v) {
    this.turn = v;
  }

  @action.bound
  setDebug(v) {
    this.debug = v;
  }

  @action.bound
  setAiEmotion(v) {
    this.aiEmotion = v;
  }

  @action.bound
  setBoard(v, id) {
    this["board" + id] = v;
    const ret = this.whoWin();
    if (ret !== -1) {
      const stage = ret === 0 ? STAGE.YOU_WIN : STAGE.AI_WIN;
      this.setStage(stage);
      Modal.info({
        title: ret === 0 ? "You are awesome." : "Game Over",
        content: <div>{ret === 0 ? "You Win!" : "AI Win!"}</div>,
        onOk() {},
      });
    }
  }

  @action.bound
  setStage(v) {
    this.stage = v;
  }

  @action.bound
  initGame(v) {
    this.board0 = this.initBoard();
    this.board1 = this.initBoard();
    this.stage = STAGE.PLAYING;
    this.turn = 0;
  }
}
export default Store;
