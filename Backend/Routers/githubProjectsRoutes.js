const express = require("express");
const router = express.Router();
const {
    getGithubProjects,
    getGithubProjectReadme,
} = require("../Controllers/githubProjectsController");

// GET /github-projects  (public)
router.get("/", getGithubProjects);

// GET /github-projects/readme?repo=<owner>/<repo>  (public)
router.get("/readme", getGithubProjectReadme);

module.exports = router;
