import React from "react";
import { Row, Col } from "antd";
import styled from "styled-components";
import { STAGE } from "../constant";
import { inject, observer } from "mobx-react";

import Cell from "./Cell.js";

const Wrapper = styled.div`
  position: relative;
  opacity: ${(props) => props.opacity};
`;

@inject("store")
@observer
class Board extends React.Component {
  render() {
    const {
      board,
      children,
      boardId,
      store: { stage, turn },
    } = this.props;
    const generateRow = (rowNum) => {
      const cols = [];
      for (let j = 0; j < 10; j++) {
        cols.push(
          <Col key={j}>
            <Cell
              row={rowNum}
              col={j}
              value={board && board[rowNum][j]}
              boardId={boardId}
            >
              Hello
            </Cell>
          </Col>
        );
      }

      return <Row>{cols}</Row>;
    };

    const generateBoard = () => {
      const ret = [];
      for (let i = 0; i < 10; i++) {
        ret.push(<Row key={i}>{generateRow(i)}</Row>);
      }
      return ret;
    };

    let opacity = 1;
    if (stage === STAGE.PLAYING) {
      opacity = turn !== boardId ? 1 : 0.3;
    }

    return (
      <Wrapper opacity={opacity}>
        {generateBoard()}
        {children}
      </Wrapper>
    );
  }
}

export default Board;
