import React, { useState, useEffect } from "react";

const Comprehension = () => {
  const initialState = {
    step: "create",
    passage: "",
    questions: [],
    currentQuestion: "",
    options: ["", "", "", ""],
    userAnswers: {},
    savedComprehensions: [],
  };

  const [state, setState] = useState(initialState);

  const addQuestion = () => {
    const { currentQuestion, options, questions } = state;

    setState({
      ...state,
      questions: [
        ...questions,
        {
          question: currentQuestion,
          options: options.filter((opt) => opt.trim() !== ""),
          correctAnswer: options[0].trim(),
        },
      ],
      currentQuestion: "",
      options: ["", "", "", ""],
    });
  };

  const handleAnswer = (questionIndex, selectedOption) => {
    setState({
      ...state,
      userAnswers: {
        ...state.userAnswers,
        [questionIndex]: selectedOption,
      },
    });
  };

  const resetApp = () => {
    setState(initialState);
  };

  const submitAnswers = async () => {
    const { passage, questions, userAnswers } = state;

    try {
      const response = await fetch("https://superbackend-c4ew.onrender.com/questionss/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ passage, questions, userAnswers }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Comprehension saved successfully!");
        resetApp();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Failed to save comprehension:", error);
    }
  };

  const fetchComprehensions = async () => {
    try {
      const response = await fetch("https://superbackend-c4ew.onrender.com/questionss/save");
      const data = await response.json();
      if (response.ok) {
        setState({ ...state, savedComprehensions: data });
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Failed to fetch comprehensions:", error);
    }
  };

  useEffect(() => {
    fetchComprehensions();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-4">
        Comprehension Builder
      </h1>

      {state.step === "create" && (
        <div className="space-y-4">
          {/* Step 1: Write the comprehension */}
          <div>
            <h2 className="text-lg font-semibold">
              Step 1: Write the Comprehension
            </h2>
            <textarea
              className="w-full border border-gray-300 rounded p-2"
              rows="5"
              placeholder="Write your comprehension passage here..."
              value={state.passage}
              onChange={(e) => setState({ ...state, passage: e.target.value })}
            />
          </div>

          {/* Step 2: Add Questions */}
          <div>
            <h2 className="text-lg font-semibold">Step 2: Add Questions</h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2 mb-2"
              placeholder="Write the question..."
              value={state.currentQuestion}
              onChange={(e) =>
                setState({ ...state, currentQuestion: e.target.value })
              }
            />

            {state.options.map((opt, index) => (
              <input
                key={index}
                type="text"
                className="w-full border border-gray-300 rounded p-2 mb-2"
                placeholder={`Option ${index + 1}`}
                value={opt}
                onChange={(e) =>
                  setState({
                    ...state,
                    options: state.options.map((o, i) =>
                      i === index ? e.target.value : o
                    ),
                  })
                }
              />
            ))}

            <button
              onClick={addQuestion}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Question
            </button>
          </div>

          <button
            onClick={() => setState({ ...state, step: "attempt" })}
            className="px-4 py-2 bg-green-500 text-white rounded mt-4"
          >
            Start Attempting
          </button>
        </div>
      )}

      {state.step === "attempt" && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Comprehension</h2>
          <p className="p-4 bg-white border border-gray-300 rounded mb-4">
            {state.passage}
          </p>

          {state.questions.map((q, index) => (
            <div key={index} className="mb-4">
              <p className="font-semibold">
                {index + 1}. {q.question}
              </p>
              {q.options.map((opt, optIndex) => (
                <div key={optIndex} className="flex items-center mb-2">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={opt}
                    checked={state.userAnswers[index] === opt}
                    onChange={() => handleAnswer(index, opt)}
                    className="mr-2"
                  />
                  <label>{opt}</label>
                </div>
              ))}
            </div>
          ))}

          <button
            onClick={submitAnswers}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Submit Answers
          </button>
        </div>
      )}

      {/* Display saved comprehensions */}
      {state.savedComprehensions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Saved Comprehensions</h2>
          {state.savedComprehensions.map((comp, index) => (
            <div
              key={index}
              className="p-4 bg-white border border-gray-300 rounded mb-4"
            >
              <p className="font-bold">{comp.passage}</p>
              {comp.questions.map((q, qIndex) => (
                <div key={qIndex}>
                  <p>
                    {qIndex + 1}. {q.question}
                  </p>
                  <ul>
                    {q.options.map((option, optIndex) => (
                      <li key={optIndex}>{option}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comprehension;
