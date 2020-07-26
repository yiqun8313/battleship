import React from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { CloseOutlined } from "@ant-design/icons";
import {
  CELL_EMPTY,
  CELL_ALIVE,
  CELL_DAMAGE,
  CELL_BOMB_WATER,
  CELL_DEAD,
  STAGE,
} from "../constant";

import { GiSmallFire, GiTargeting } from "react-icons/gi";
import { isValidSpot } from "../tools";
const StyledCell = styled.div`
  width: 50px;
  height: 50px;
  border-right-style: solid;
  border-bottom-style: solid;
  border-left-style: ${(props) => (props.leftBoard ? "solid" : "")};
  border-top-style: ${(props) => (props.topBoard ? "solid" : "")};
  border-color: black;
  border-width: 0.2px;
  background-color: ${(props) => props.backgroundColor};
`;
const StyledLabel = styled.div`
  position: absolute;
  left: -30px;
  top: 15px;
`;

const CellWrapper = styled.div`
  position: relative;
`;

const BombWrapper = styled.div`
  position: relative;
  top: 10px;
  left: 10px;
`;

const ValueWrapper = styled.div`
  position: absolute;
`;

const intToChar = (num) => {
  return String.fromCharCode("A".charCodeAt(0) + num);
};

@inject("store")
@observer
class Cell extends React.Component {
  getBoard = (boardId) => {
    const {
      store: { board1, board0 },
    } = this.props;

    return boardId === 0 ? board0 : board1;
  };

  getRandomOpt = (opts) => {
    const idx = Math.floor(Math.random() * opts.length);
    return opts[idx];
  };

  findOnfireNeiber = (optsOnFire, board) => {
    if (optsOnFire.length === 0) return null;

    for (let i = 0; i < optsOnFire.length; i++) {
      const [x, y] = optsOnFire[i];
      console.log("test X, Y: " + x + "," + y);
      const canSpot =
        this.canBomb(x + 1, y, board) ||
        this.canBomb(x - 1, y, board) ||
        this.canBomb(x, y + 1, board) ||
        this.canBomb(x, y - 1, board);
      if (canSpot) return canSpot;
    }

    return null;
  };

  canBomb = (x, y, board) => {
    if (!isValidSpot(x, y)) return null;
    if (board[x][y] < CELL_BOMB_WATER) {
      return [x, y];
    }
    return null;
  };

  aiBomb = () => {
    const {
      store: { setTurn, board0 },
    } = this.props;

    const opts = [];
    const optsOnFire = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (board0[i][j] < CELL_BOMB_WATER) {
          opts.push([i, j]);
        }

        if (board0[i][j] === CELL_DAMAGE) {
          optsOnFire.push([i, j]);
        }
      }
    }

    let opt =
      this.findOnfireNeiber(optsOnFire, board0) || this.getRandomOpt(opts);
    if (!opt) {
      return;
    }

    const [x, y] = opt;
    const success = this.bombCell(x, y, 0);
    const {
      store: { stage },
    } = this.props;
    if (stage === STAGE.AI_WIN) {
      return;
    }

    if (success) {
      this.aIPlay();
    } else {
      setTurn(0);
    }
  };

  getRandomGap = () => {
    return Math.floor(Math.random() * 3) + 2;
  };

  aIPlay = () => {
    const {
      store: { aiEmotion },
    } = this.props;

    const gap = aiEmotion ? this.getRandomGap() * 1000 : 500;
    setTimeout(() => {
      this.aiBomb();
    }, gap);
  };

  getValue = () => {
    const { row, col, boardId } = this.props;
    const board = this.getBoard(boardId);
    const value = board[row][col];
    return value;
  };

  dfs = (x, y, board) => {
    if (x < 0 || x >= 10 || y < 0 || y >= 10) {
      return false;
    }

    const v = board[x][y];
    if (v === CELL_ALIVE) return true;
    if (v === CELL_EMPTY || v === CELL_BOMB_WATER) return false;

    const tmp = board[x][y];
    board[x][y] = 0;
    const ret =
      this.dfs(x - 1, y, board) ||
      this.dfs(x + 1, y, board) ||
      this.dfs(x, y + 1, board) ||
      this.dfs(x, y - 1, board);
    board[x][y] = tmp;
    return ret;
  };

  findShipSpots = (board, x, y, spots) => {
    if (x < 0 || x >= 10 || y < 0 || y >= 10) {
      return false;
    }

    const v = board[x][y];
    if (v === CELL_EMPTY || v === CELL_BOMB_WATER) return;
    spots.push([x, y]);

    const tmp = board[x][y];
    board[x][y] = CELL_EMPTY;
    this.findShipSpots(board, x + 1, y, spots);
    this.findShipSpots(board, x - 1, y, spots);
    this.findShipSpots(board, x, y + 1, spots);
    this.findShipSpots(board, x, y - 1, spots);
    board[x][y] = tmp;
  };

  setShipDead = (board, x, y) => {
    if (x < 0 || x >= 10 || y < 0 || y >= 10) {
      return;
    }

    const v = board[x][y];
    if (v === CELL_EMPTY || v === CELL_BOMB_WATER || v === CELL_DEAD) return;

    board[x][y] = CELL_DEAD;
    this.setShipDead(board, x - 1, y);
    this.setShipDead(board, x + 1, y);
    this.setShipDead(board, x, y + 1);
    this.setShipDead(board, x, y - 1);
  };

  isShipLive = (x, y, board) => {
    return this.dfs(x, y, board);
  };

  clearSurround = (board, shipSports) => {
    shipSports.forEach((e) => {
      const [x, y] = e;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          this.throwBomToSurrand(x + i, y + j, board);
        }
      }
    });
  };

  throwBomToSurrand = (x, y, board) => {
    if (!isValidSpot(x, y) || board[x][y] !== CELL_EMPTY) return;
    board[x][y] = CELL_BOMB_WATER;
  };

  bombCell = (x, y, boardId) => {
    const {
      store: { setBoard },
    } = this.props;

    const board = this.getBoard(boardId);
    const value = board[x][y];
    let success = true;
    if (value === CELL_ALIVE) {
      board[x][y] = CELL_DAMAGE;
      if (!this.isShipLive(x, y, board)) {
        this.setShipDead(board, x, y);
        const shipSports = [];
        this.findShipSpots(board, x, y, shipSports);
        this.clearSurround(board, shipSports);
      }
    } else if (value === CELL_EMPTY) {
      board[x][y] = CELL_BOMB_WATER;
      success = false;
    }

    setBoard(board, boardId);
    return success;
  };

  clickCell = () => {
    const {
      store: { setTurn, turn, stage },
      row,
      col,
    } = this.props;

    if (turn === 1 || stage !== STAGE.PLAYING) return;
    const success = this.bombCell(row, col, 1);
    if (success) return;

    setTurn(1);
    this.aIPlay();
  };

  renderBomb = () => {
    const value = this.getValue();
    if (value < CELL_BOMB_WATER) return null;

    return (
      <BombWrapper>
        {value > CELL_BOMB_WATER ? (
          <GiSmallFire
            className={"Bomb"}
            color={value === CELL_DAMAGE ? "#f5222d" : "black"}
            size={28}
          />
        ) : (
          <CloseOutlined style={{ fontSize: "26px" }} className={"WaterBomb"} />
        )}
      </BombWrapper>
    );
  };

  render() {
    const {
      boardId,
      row,
      col,
      store: { debug },
    } = this.props;
    const value = this.getValue();

    const charlabel = (col) => {
      return intToChar(col);
    };

    const backgroundColor = value === CELL_BOMB_WATER ? "#f0f0f0" : "";

    return (
      <div>
        {row === 0 ? charlabel(col) : null}
        <CellWrapper>
          <StyledCell
            onClick={boardId === 0 ? null : this.clickCell}
            leftBoard={col === 0}
            topBoard={row === 0}
            backgroundColor={backgroundColor}
          >
            {debug && <ValueWrapper>{value}</ValueWrapper>}
            {this.renderBomb()}
          </StyledCell>
          <StyledLabel>{col === 0 ? row : null}</StyledLabel>
        </CellWrapper>
      </div>
    );
  }
}

export default Cell;
