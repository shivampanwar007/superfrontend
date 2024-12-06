import React from "react";
import "./index.css";
import CategorizationQuestion from "./CategorizationQuestion";
import Cloze from "./Cloze";
import Comprehension from "./Comprehension";

const App = () => {
  return (
    <>
      <CategorizationQuestion />
      <Cloze />
      <Comprehension />
    </>
  );
};

export default App;
