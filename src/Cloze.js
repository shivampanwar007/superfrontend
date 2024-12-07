import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemType = {
  OPTION: "option",
};

const Option = ({ text }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType.OPTION,
    item: { text },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`px-4 py-2 bg-purple-500 text-white font-medium rounded-lg cursor-pointer shadow-md ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      {text}
    </div>
  );
};

const Blank = ({ blankIndex, onDrop, currentText }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemType.OPTION,
    drop: (item) => onDrop(blankIndex, item.text),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`w-24 h-10 border-2 border-dashed rounded-lg flex items-center justify-center ${
        isOver ? "border-blue-500 bg-blue-100" : "border-gray-400"
      }`}
    >
      {currentText || ""}
    </div>
  );
};

const Cloze = () => {
  const [question, setQuestion] = useState("");
  const [editableQuestion, setEditableQuestion] = useState([]);
  const [blanks, setBlanks] = useState([]);
  const [options, setOptions] = useState({});
  const [isAttemptMode, setIsAttemptMode] = useState(false);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleGenerateQuestion = () => {
    const parts = question.split(" ");
    setEditableQuestion(
      parts.map((word, index) => ({ id: index, text: word, isBlank: false }))
    );
    setBlanks([]);
    setOptions({});
    setAnswers({});
    setIsAttemptMode(false);
    setIsFinished(false);
  };

  const handleMarkBlank = (index) => {
    const updatedQuestion = editableQuestion.map((word, i) =>
      i === index ? { ...word, isBlank: true } : word
    );
    setEditableQuestion(updatedQuestion);

    if (!blanks.includes(index)) {
      setBlanks([...blanks, index]);
      setOptions({ ...options, [index]: [] });
    }
  };

  const handleAddOptions = (index, value) => {
    const optionArray = value.split(",").map((opt) => opt.trim());
    setOptions((prevOptions) => ({ ...prevOptions, [index]: optionArray }));
  };

  const handleDrop = (blankIndex, text) => {
    setAnswers((prev) => ({ ...prev, [blankIndex]: text }));
  };

  const saveToBackend = async () => {
    const data = {
      question,
      blanks,
      options,
      answers,
    };

    try {
      const response = await fetch("https://superbackend-c4ew.onrender.com/questioning/savees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        console.log(result.message);
        setIsFinished(true);
      } else {
        console.error("Failed to save question:", result.message);
      }
    } catch (error) {
      console.error("Error while saving data:", error);
    }
  };

  const handleSaveAnswers = () => {
    saveToBackend();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
        <div className="max-w-4xl bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Create and Attempt Cloze Questions
          </h1>

          {/* Step 1: Input the question */}
          {!isAttemptMode && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Enter your question:
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md mb-4"
                rows="3"
                placeholder="Write your question here"
                value={question}
                onChange={handleQuestionChange}
              />
              <button
                onClick={handleGenerateQuestion}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Generate Question
              </button>
            </div>
          )}

          {/* Step 2: Editable question */}
          {editableQuestion.length > 0 && !isAttemptMode && (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-gray-700 mb-4">
                Mark Blanks:
              </h2>
              <div className="text-lg text-gray-800 mb-6 flex flex-wrap">
                {editableQuestion.map((word, index) => (
                  <span
                    key={index}
                    className={`mx-1 px-2 py-1 border rounded-lg cursor-pointer ${
                      word.isBlank
                        ? "bg-yellow-300 border-yellow-500"
                        : "bg-gray-200"
                    }`}
                    onClick={() => handleMarkBlank(index)}
                  >
                    {word.text}
                  </span>
                ))}
              </div>
              {blanks.map((blank, i) => (
                <div key={i} className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Options for Blank {i + 1}:
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-md"
                    placeholder="Enter options separated by commas"
                    onBlur={(e) => handleAddOptions(blank, e.target.value)}
                  />
                </div>
              ))}
              <button
                onClick={() => setIsAttemptMode(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg mt-6"
              >
                Switch to Attempt Mode
              </button>
            </div>
          )}

          {/* Step 3: Attempt the question */}
          {isAttemptMode && (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-gray-700 mb-4">
                Attempt the Question:
              </h2>
              <div className="text-lg text-gray-800 mb-6 flex flex-wrap">
                {editableQuestion.map((word, index) => (
                  <span
                    key={index}
                    className={`mx-1 px-2 py-1 border rounded-lg ${
                      word.isBlank ? "bg-gray-100" : "bg-gray-200"
                    }`}
                  >
                    {word.isBlank ? (
                      <Blank
                        blankIndex={index}
                        onDrop={handleDrop}
                        currentText={answers[index]}
                      />
                    ) : (
                      word.text
                    )}
                  </span>
                ))}
              </div>

              {/* Render the options here */}
              <div className="mt-6">
                <h3 className="font-medium text-lg text-gray-700 mb-4">
                  Options:
                </h3>
                {blanks.map((blank, i) => (
                  <div key={i} className="mb-4">
                    <h4 className="text-gray-700">
                      Blank {blank + 1} Options:
                    </h4>
                    <div className="flex space-x-2">
                      {options[blank]?.map((option, idx) => (
                        <Option key={idx} text={option} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveAnswers}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-6"
              >
                Save Answers
              </button>
            </div>
          )}

          {/* Step 4: Finished state */}
          {isFinished && (
            <div className="mt-6">
              <h2 className="text-green-600 text-xl">
                Answers saved successfully!
              </h2>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default Cloze;
