import React, { useState } from "react";
import axios from "axios";
import "./addproject.css";
import { useNavigate } from "react-router-dom";

function AddProject() {
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({
        title: "",
        technology: "",
        url: "",
    });
    const [image, setImage] = useState(null);

    const handleChange = (e) => {
        setInputs((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", inputs.title);
        formData.append("technology", inputs.technology);
        formData.append("url", inputs.url);
        formData.append("image", image);

        try {
            await axios.post("http://localhost:5000/projects", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            navigate('/dashboard');
        } catch (error) {
            console.error("There was an error adding the project!", error);
        }
    };

    return (
        <div>
            <div className="dashbord-title">
                <h1 className="dashbord-title1">Add</h1>
                <h1 className="dashbord-title2">New Project</h1>
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

                    <input type="file" onChange={handleImageChange} />
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
