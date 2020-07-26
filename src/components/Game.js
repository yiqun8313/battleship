import React from "react";
import {
  Badge,
  Divider,
  Card,
  Switch,
  Statistic,
  Button,
  Row,
  Col,
} from "antd";
import styled from "styled-components";
import Board from "./Board";
import Ship from "./Ship";
import { inject, observer } from "mobx-react";
import { STAGE } from "../constant";

const Wrapper = styled.div`
  margin-bottom: 20px;
  margin-top: 50px;
`;

const AIBadge = styled.div`
  margin-left: 30px;
`;

const PlayBoard = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
`;

const Turn = styled.div`
  font-size: 24px;
  height: 80px;
`;

const StyledDashboard = styled(Card)`
  margin-top: 50px;
`;

const Result = styled.div``;

const DebugWrapper = styled.div`
  margin-bottom: 10px;
`;

const randomDir = () => {
  const n = Math.floor(Math.random() * 2);
  return n === 1;
};

@inject("store")
@observer
class Game extends React.Component {
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

  state = {
    turn: 0,
    ships0: [],
    ships1: [],
  };

  startGame = () => {
    const {
      store: { initGame },
    } = this.props;
    initGame();

    const {
      store: { setBoard, board0, board1 },
    } = this.props;
    const ships0 = this.generateShips();
    const ships1 = this.generateShips();

    ships0.forEach((ship) => {
      this.placeShip(board0, ship);
    });

    ships1.forEach((ship) => {
      this.placeShip(board1, ship);
    });

    this.setState({ ships0, ships1 });
    setBoard(board0, 0);
    setBoard(board1, 1);
  };

  isRange = (x, y) => {
    return !(x < 0 || x >= 10 || y < 0 || y >= 10);
  };

  expandSafe = (x, y, board) => {
    for (let i = x - 1; i <= x + 1; i++) {
      for (let j = y - 1; j <= y + 1; j++) {
        if (!this.isRange(i, j)) continue;
        if (board[i][j] !== 0) {
          return false;
        }
      }
    }

    return true;
  };

  shipInBoardNoOverlap = (shipSpots, board) => {
    return shipSpots.every((e) => {
      const [x, y] = e;
      if (!this.isRange(x, y)) return false;
      return this.expandSafe(x, y, board);
    });
  };

  getShipSpots = (x, y, ship) => {
    let { rows, cols, vertical } = ship;

    const shipSpots = [];
    if (vertical) {
      while (rows > 0) {
        rows--;
        shipSpots.push([x + rows, y]);
      }
    } else {
      while (cols > 0) {
        cols--;
        shipSpots.push([x, y + cols]);
      }
    }
    return shipSpots;
  };

  canPlaceShip = (board, x, y, ship) => {
    const shipSpots = this.getShipSpots(x, y, ship);
    return this.shipInBoardNoOverlap(shipSpots, board);
  };

  putInShip = (board, ship, spot) => {
    if (!spot) return;
    const [x, y] = spot;
    const shipSpots = this.getShipSpots(x, y, ship);
    // const { rows, cols } = ship;
    shipSpots.forEach((e) => {
      const [x, y] = e;
      board[x][y] = 1;
    });
  };

  placeShip = (board, ship) => {
    const spots = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (this.canPlaceShip(board, i, j, ship)) {
          spots.push([i, j]);
        }
      }
    }

    const spotIdx = Math.floor(Math.random() * spots.length);
    const spot = spots[spotIdx];
    this.putInShip(board, ship, spot);
    if (!spot) {
      console.log("error happend, could not place ship.");
      return;
    }
    ship.x = spot[0];
    ship.y = spot[1];
  };

  generateShips = () => {
    const ships0 = [
      { size: 4, vertical: randomDir() },
      { size: 3, vertical: randomDir() },
      { size: 3, vertical: randomDir() },
      { size: 2, vertical: randomDir() },
      { size: 2, vertical: randomDir() },
      { size: 2, vertical: randomDir() },
      { size: 1, vertical: randomDir() },
      { size: 1, vertical: randomDir() },
      { size: 1, vertical: randomDir() },
      { size: 1, vertical: randomDir() },
    ].map((ship) => {
      const { vertical, size } = ship;
      const rows = vertical ? size : 1;
      const cols = vertical ? 1 : size;
      return { ...ship, rows, cols };
    });

    return ships0;
  };

  renderShips = (ships) => {
    return ships.map((ship, i) => {
      const { rows, cols, x, y } = ship;
      return <Ship rows={rows} cols={cols} x={x} y={y} key={i}></Ship>;
    });
  };

  renderTurn = () => {
    const {
      store: { turn, stage },
    } = this.props;

    let text =
      turn === 0 ? (
        "Your Turn"
      ) : (
        <div>
          AI Turn
          <AIBadge>
            <Badge status="processing" text="Processing" />
          </AIBadge>
        </div>
      );
    if (stage === STAGE.AI_WIN) {
      text = "AI Win";
    } else if (stage === STAGE.YOU_WIN) {
      text = "You Win";
    } else if (stage === STAGE.NOT_START) {
      text = "Press Start button to start game";
    }

    return <Turn>{text}</Turn>;
  };

  getResultText = () => {
    const {
      store: { stage },
    } = this.props;
    if (stage === STAGE.NOT_START) return "Not Start";

    if (stage === STAGE.YOU_WIN) {
      return "You Win!";
    } else if (stage === STAGE.AI_WIN) {
      return "AI Win!";
    }

    return "Playing";
  };

  renderResult = () => {
    return (
      <Result>
        <Statistic title="Result" value={this.getResultText()} />
      </Result>
    );
  };

  renderBtn = () => {
    const {
      store: { stage },
    } = this.props;

    let text = "Start Game";
    if (stage === STAGE.PLAYING) {
      text = "Start New Game";
    }

    return (
      <Button type="primary" onClick={this.startGame}>
        {text}
      </Button>
    );
  };

  render() {
    const { ships0 } = this.state;
    const {
      store: { board0, board1, debug, setDebug, aiEmotion, setAiEmotion },
    } = this.props;

    return (
      <Wrapper>
        {/* <ControlLine></ControlLine> */}
        <Row>
          <Col span={10}>
            <PlayBoard title="p1">
              <Board board={board0} boardId={0}>
                {this.renderShips(ships0)}
              </Board>
            </PlayBoard>
          </Col>
          <Col span={4}>
            <StyledDashboard title="Dashboard">
              {this.renderBtn()}
              <Divider />
              {this.renderTurn()}
              <Divider />
              <DebugWrapper>Debug:</DebugWrapper>
              <Switch
                checked={debug}
                onChange={(checked) => {
                  setDebug(checked);
                }}
              />
              <Divider />
              <DebugWrapper>AI Emotion:</DebugWrapper>
              <Switch
                checked={aiEmotion}
                onChange={(checked) => {
                  setAiEmotion(checked);
                }}
              />
            </StyledDashboard>
          </Col>
          <Col span={10}>
            <PlayBoard title="p2">
              <Board board={board1} boardId={1}></Board>
            </PlayBoard>
          </Col>
        </Row>
      </Wrapper>
    );
  }
}

export default Game;
