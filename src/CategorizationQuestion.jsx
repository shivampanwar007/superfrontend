import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

const CategorizationQuestion = () => {
  const [categories, setCategories] = useState([]);
  const [options, setOptions] = useState([]);
  const [formState, setFormState] = useState({
    categoryName: "",
    optionName: "",
  });
  const [categoryState, setCategoryState] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const addCategory = () => {
    if (formState.categoryName) {
      const newCategory = { name: formState.categoryName, items: [] };
      setCategories((prev) => [...prev, newCategory]);
      setCategoryState((prev) => ({
        ...prev,
        [formState.categoryName]: [],
      }));
      setFormState((prev) => ({ ...prev, categoryName: "" }));
    }
  };

  const addOption = () => {
    if (formState.optionName) {
      setOptions((prev) => [
        ...prev,
        { id: Date.now(), name: formState.optionName },
      ]);
      setFormState((prev) => ({ ...prev, optionName: "" }));
    }
  };

  const startCategorization = () => {
    setIsSubmitted(true);
  };

  const handleDragStart = (e, option) => {
    e.dataTransfer.setData("option", JSON.stringify(option));
  };

  const handleDrop = (e, categoryName) => {
    e.preventDefault();
    const option = JSON.parse(e.dataTransfer.getData("option"));
    setCategoryState((prev) => ({
      ...prev,
      [categoryName]: [...prev[categoryName], option],
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const saveToDatabase = () => {
    const dataToSave = categories.map((category) => ({
      name: category.name,
      options: categoryState[category.name],
    }));

    console.log("Data to save:", dataToSave);
    axios
      .post("https://superbackend-c4ew.onrender.com/question", { categories: dataToSave })
      .then((response) => {
        alert("Data saved successfully!");
        console.log(response.data);

        setCategories([]);
        setOptions([]);
        setCategoryState({});
        setFormState({ categoryName: "", optionName: "" });
        setIsSubmitted(false);
      })
      .catch((error) => {
        console.error(error);
        alert("Failed to save data.");
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {!isSubmitted ? (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-md shadow space-y-6">
          <h1 className="text-xl font-bold text-gray-700">
            Create Categorization Question
          </h1>

          {/* Category Input */}
          <div className="space-y-2">
            <label
              htmlFor="categoryName"
              className="block text-sm font-medium text-gray-600"
            >
              Add Category
            </label>
            <input
              type="text"
              id="categoryName"
              name="categoryName"
              value={formState.categoryName}
              onChange={handleInputChange}
              placeholder="Enter category name"
              className="w-full border border-gray-300 p-2 rounded-md"
            />
            <button
              onClick={addCategory}
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
            >
              Add Category
            </button>
          </div>

          {/* Option Input */}
          <div className="space-y-2">
            <label
              htmlFor="optionName"
              className="block text-sm font-medium text-gray-600"
            >
              Add Option
            </label>
            <input
              type="text"
              id="optionName"
              name="optionName"
              value={formState.optionName}
              onChange={handleInputChange}
              placeholder="Enter option name"
              className="w-full border border-gray-300 p-2 rounded-md"
            />
            <button
              onClick={addOption}
              className="bg-green-500 text-white px-4 py-2 rounded-md mt-2"
            >
              Add Option
            </button>
          </div>

          {/* Display Added Categories and Options */}
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-600">Categories</h2>
            <ul>
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <li key={index}>{category.name}</li>
                ))
              ) : (
                <p>No categories available</p>
              )}
            </ul>

            <h2 className="font-semibold text-gray-600">Options</h2>
            <ul>
              {options.length > 0 ? (
                options.map((option) => <li key={option.id}>{option.name}</li>)
              ) : (
                <p>No options available</p>
              )}
            </ul>
          </div>

          <button
            onClick={startCategorization}
            className="bg-indigo-600 text-white px-6 py-3 rounded-md w-full"
          >
            Start Categorization
          </button>
        </div>
      ) : (
        <div className="flex gap-8 p-8">
          {/* Categories */}
          <div className="w-1/2 space-y-6">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div
                  key={category.name}
                  className="bg-blue-100 p-4 rounded-md shadow"
                >
                  <h3 className="text-lg font-bold text-blue-600">
                    {category.name}
                  </h3>
                  <div
                    className="bg-white border-2 border-dashed h-32 mt-4 rounded-md flex items-center justify-center"
                    onDrop={(e) => handleDrop(e, category.name)}
                    onDragOver={handleDragOver}
                  >
                    {categoryState[category.name]?.length === 0 ? (
                      <p className="text-gray-400">Drop items here</p>
                    ) : (
                      <ul>
                        {categoryState[category.name]?.map((item) => (
                          <li key={item.id}>{item.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No categories available</p>
            )}
          </div>

          {/* Options */}
          <div className="w-1/3 bg-gray-100 p-4 rounded-md shadow">
            <h3 className="text-lg font-bold text-gray-600">Options</h3>
            <div>
              {options.length > 0 ? (
                options.map((option) => (
                  <div
                    key={option.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, option)}
                    className="bg-green-200 p-2 rounded-md cursor-pointer mt-2"
                  >
                    {option.name}
                  </div>
                ))
              ) : (
                <p>No options available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      {isSubmitted && (
        <button
          onClick={saveToDatabase}
          className="mt-8 bg-green-600 text-white px-6 py-3 rounded-md w-full"
        >
          Save
        </button>
      )}
    </div>
  );
};

export default CategorizationQuestion;
