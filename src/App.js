import { Provider } from "mobx-react";
import React from "react";
import mainLogo from "./ship.png";
import "./App.css";
import Game from "./components/Game.js";
import styled from "styled-components";
import Store from "./store";

const Title = styled.div`
  font-size: 45px;
  margin-top: -110px;
`;

const Author = styled.div`
  font-size: 19px;
  padding-bottom: 20px;
`;

const store = {
  store: new Store(),
};

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={mainLogo} alt="fireSpot" className="App-logo" />
        <Title>Battleship</Title>
        <Author>
          <a
            className="App-link"
            href="https://www.linkedin.com/in/yuzhangcmu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Will Zhang
          </a>
        </Author>
      </header>
      <Provider {...store}>
        <Game />
      </Provider>
    </div>
  );
}

// function App() {
//   return (
//     <div className="App">
//       <Button type="primary">Button</Button>
//     </div>
//   );
// }

export default App;
