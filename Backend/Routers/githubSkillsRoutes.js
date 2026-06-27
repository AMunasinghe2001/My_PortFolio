const express = require("express");
const router = express.Router();
const { getGithubSkills } = require("../Controllers/githubSkillsController");

router.get("/", getGithubSkills);

module.exports = router;
