import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../AddProject/addproject.css";

function UpdateProject() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({
        title: "",
        technology: "",
        url: "",
    });
    const [image, setImage] = useState(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await axios.get(`https://anushanga_munasinghe.vercel.app/projects/${id}`);
                const project = res.data.project;
                setInputs({
                    title: project.title,
                    technology: project.technology,
                    url: project.url,
                });
            } catch (error) {
                console.error("There was an error fetching the project!", error);
            }
        };
        fetchProject();
    }, [id]);

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
        if (image) {
            formData.append("image", image);
        }

        try {
            await axios.put(`https://anushanga_munasinghe.vercel.app/projects/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            navigate('/dashboard');
        } catch (error) {
            console.error("There was an error updating the project!", error);
        }
    };

    return (
        <div>
            <div className="contact-title">
                <h1 className="contact-title1">Update</h1>
                <h1 className="contact-title2">Project</h1>
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
                        Update Project <i className="fas fa-paper-plane"></i>
                    </button>
                    <br />
                    <br />
                </form>
            </div>
        </div>
    );
}

export default UpdateProject;
