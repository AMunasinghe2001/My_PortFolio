import React, { useState } from "react";
import axios from "axios";
import "./addproject.css";
import { Link } from "react-router-dom";
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'; // Import the correct icon

const AddProject = () => {
  const [title, setTitle] = useState("");
  const [technology, setTechnology] = useState("");
  const [url, setUrl] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProject = { title, technology, url};

    axios
      .post("http://localhost:5000/projects", newProject)
      .then((response) => {
        console.log("Project added:", response.data);
        setTitle("");
        setTechnology("");
        setUrl("");
        setShowPopup(true);
      })
      .catch((error) =>
        console.error("There was an error adding the project!", error)
      );
  };

  return (
    <div>
      {showPopup && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50">
          <div className="bg-gray-800 bg-opacity-75 fixed inset-0 flex justify-center items-center">
            <div className="fixed inset-0 flex items-center justify-center">
              <div className="bg-gray-100 shadow-lg rounded-lg p-8 max-w-md border-4 border-green-500 w-[500px]">
                <div className="text-center mb-6">
                  <CheckCircleOutlineRoundedIcon className="text-green-500 w-16 h-16 mx-auto" sx={{ fontSize: 64 }} />
                  <h2 className="text-2xl font-bold text-gray-800 font-sfpro"> Thank You for Submitting!</h2>
                  <p className="text-gray-600 font-sfpro">Your submission has been received successfully.</p>
                </div>
                <div className="text-center">
                  <Link to="/onlineStockManager/FIteamTable">
                    <button onClick={() => setShowPopup(false)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline w-[100px] font-sfpro">Done</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <br />
          <br />

          <label>Technology</label>
          <br />
          <input
            type="text"
            placeholder="Technology"
            value={technology}
            onChange={(e) => setTechnology(e.target.value)}
          />
          <br />
          <br />

          <label>URL</label>
          <br />
          <input
            type="text"
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
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
};

export default AddProject;
