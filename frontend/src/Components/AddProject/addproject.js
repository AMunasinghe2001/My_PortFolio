import React, { useState } from "react";
import axios from "axios";
import "./addproject.css";
import { useNavigate } from "react-router-dom";

function AddProject() {
  const history = useNavigate();
  const [inputs, setInputs] = useState({
    title: "",
    technology: "",
    url: "",
  });

  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const newProject = {
        title: inputs.title,
        technology: inputs.technology,
        url: inputs.url,
      };

      // Make the API request to save the new project
      await axios.post("http://localhost:5000/projects", newProject);

      // Redirect to dashboard after successful submission
      history('/dashboard');
    } catch (error) {
      console.error("There was an error adding the project!", error);
    }
  };

  return (
    <div>
      <div className="contact-title">
        <h1 className="contact-title1">Add</h1>
        <h1 className="contact-title2">New Project</h1>
      </div>
      <div className="countact">
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <br />
          <input
            type="text"
            placeholder="Title"
            value={inputs.title}
            name="title"
            onChange={handleChange}
          />
          <br />
          <br />

          <label>Technology</label>
          <br />
          <input
            type="text"
            placeholder="Technology"
            value={inputs.technology}
            name="technology"
            onChange={handleChange}
          />
          <br />
          <br />

          <label>URL</label>
          <br />
          <input
            type="text"
            placeholder="URL"
            value={inputs.url}
            name="url"
            onChange={handleChange}
          />
          <br />
          <br />

          <button type="submit" className="submit-btn">
            Add Project <i className="fas fa-paper-plane"></i>
          </button>
          <br />
          <br />
        </form>
      </div>
    </div>
  );
}

export default AddProject;
