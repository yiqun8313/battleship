import React from "react";
import styled from "styled-components";
import Draggable from "react-draggable";

const Wrapper = styled.div`
  position: absolute;
  left: ${(props) => `${props.y * 50}px`}; // 166
  top: ${(props) => `${props.x * 50 + 22}px`}; // 22
`;

const ShipCore = styled.div`
  border-style: solid;
  border-width: 2px;
  border-color: #1890ff;
  background-color: rgba(24, 144, 255, 0.3);
  cursor: grab;
  width: ${(props) => `${props.cols * 50}px`};
  height: ${(props) => `${props.rows * 50}px`};
`;

export default function Ship({ rows, cols, x, y }) {
  return (
    <Wrapper x={x} y={y}>
      <Draggable
        defaultPosition={{ x: 0, y: 0 }}
        position={null}
        grid={[1, 1]}
        scale={1}
        // onStart={this.handleStart}
        // onDrag={this.handleDrag}
        // onStop={this.handleStop}
      >
        <ShipCore cols={cols} rows={rows}></ShipCore>
      </Draggable>
    </Wrapper>
  );
}
