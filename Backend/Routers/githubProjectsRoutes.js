const express = require("express");
const router = express.Router();
const {
    getGithubProjects,
    getGithubProjectReadme,
    getGithubProjectImage,
} = require("../Controllers/githubProjectsController");

// GET /github-projects  (public)
router.get("/", getGithubProjects);

// GET /github-projects/readme?repo=<owner>/<repo>  (public)
router.get("/readme", getGithubProjectReadme);

// GET /github-projects/image?repo=<owner>/<repo>&path=<path>&ref=<branch>  (public)
router.get("/image", getGithubProjectImage);

module.exports = router;
