/**
 * Migrates the portfolio's previously-hardcoded content into MongoDB so the
 * site is fully populated from day one. Images bundled in the frontend are
 * uploaded to Cloudinary (when keys are configured) and their URLs stored.
 *
 * Usage:
 *   npm run seed            # only fills collections that are currently empty
 *   npm run seed -- --force # wipes the content collections and re-seeds
 *
 * NOTE: run this locally — it reads image files from ../../frontend.
 */
require("dotenv").config();
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const cloudinary = require("../config/cloudinary");
const { isCloudinaryConfigured } = require("../config/cloudinary");

const Profile = require("../Models/profileModel");
const Project = require("../Models/projectModel");
const Skill = require("../Models/skillModel");
const Journey = require("../Models/journeyModel");
const Service = require("../Models/serviceModel");

const FORCE = process.argv.includes("--force");
const FRONTEND_IMG = path.join(__dirname, "..", "..", "frontend", "src", "Components");

// ---- Cloudinary upload helper -------------------------------------------------
const cloudinaryEnabled = isCloudinaryConfigured();
const uploadCache = {};

async function uploadImage(relPath) {
    if (!cloudinaryEnabled) return "";
    if (uploadCache[relPath]) return uploadCache[relPath];

    const abs = path.join(FRONTEND_IMG, relPath);
    if (!fs.existsSync(abs)) {
        console.warn(`   ⚠ image not found, skipping: ${relPath}`);
        return "";
    }
    try {
        const res = await cloudinary.uploader.upload(abs, { folder: "portfolio" });
        uploadCache[relPath] = res.secure_url;
        console.log(`   ↑ uploaded ${relPath}`);
        return res.secure_url;
    } catch (err) {
        console.warn(`   ⚠ upload failed for ${relPath}: ${err.message}`);
        return "";
    }
}

// ---- Source data (mirrors the old hardcoded React data) -----------------------
const projectData = [
    { title: "Portfolio", technology: "MERN Stack", url: "https://github.com/AMunasinghe2001/My_PortFolio", img: "Project/img/portfolio.jpg" },
    { title: "Hottel Booking", technology: "PHP | JavaScript | CSS | SQL", url: "https://github.com/AMunasinghe2001/hotelBookingSystem", img: "Project/img/hotelbook.jpg" },
    { title: "Task Master App", technology: "XML | Kotlin", url: "https://github.com/AMunasinghe2001/TaskMasterApp", img: "Project/img/todo app.jpg" },
    { title: "Game App", technology: "XML | Kotlin", url: "https://github.com/AMunasinghe2001/Game_App", img: "Project/img/game app.jpg" },
    { title: "Furniture Manage Web App", technology: "MERN Stack", url: "https://github.com/it22606006/Rukshan-Furniture", img: "Project/img/itp.jpg" },
    { title: "Pet Care App", technology: "XML | Kotlin", url: "", img: "Project/img/mad.jpg" },
    { title: "Travel Booking Web", technology: "JSP |Java |SQL", url: "https://github.com/AMunasinghe2001/Book-Tour-website-OOP", img: "Project/img/oop.jpg" },
    { title: "Rukshan Furniture Web", technology: "MERN Stack | Vite", url: "https://github.com/Bashitha-Weerapperuma/Rukshan-furniture-demo", img: "Project/img/rukshanferniture.jpg" },
    { title: "Share me Web", technology: "React | Spring Boot", url: "https://github.com/oshanLahiru0307/Share_me-App", img: "Project/img/PAF.png" },
    { title: "Home Stock Web App", technology: "MERN Stack", url: "https://github.com/oshanLahiru0307/ITPM_Project", img: "Project/img/ITPM.png" },
];

const skillData = [
    { title: "FIGMA", percentage: 97, category: "technical" },
    { title: "HTML 5", percentage: 96, category: "technical" },
    { title: "CSS", percentage: 96, category: "technical" },
    { title: "JavaScript", percentage: 72, category: "technical" },
    { title: "React JS", percentage: 89, category: "technical" },
    { title: "PHP", percentage: 83, category: "technical" },
    { title: "MySQL", percentage: 71, category: "technical" },
    { title: "Communication", percentage: 90, category: "professional" },
    { title: "Team Work", percentage: 95, category: "professional" },
    { title: "Project Management", percentage: 87, category: "professional" },
    { title: "Creativity", percentage: 95, category: "professional" },
];

// Listed in display order (newest first), matching the old timeline.
const journeyData = [
    { title: "Web Desing for Beginners", duration: "2024", institution: "University of Moratuwa", img: "Journey/img/uom.png" },
    { title: "Phython for Beginners", duration: "2024", institution: "University of Moratuwa", img: "Journey/img/uom.png" },
    { title: "Bachelor of Information Technology", duration: "2022 - Present", institution: "Sri Lanka Institute of Information Technology", img: "Journey/img/sliit.png" },
    { title: "Information Communications Technology", duration: "2017 - 2021", institution: "H/Ruhunu Vijayaba National College", img: "Journey/img/rvc.png" },
    { title: "Information Communications Technology", duration: "2012 - 2017", institution: "H/Tangalle National Boys School", img: "Journey/img/tnbs.png" },
];

const serviceData = [
    { title: "Frontend Develop", icon: "FaLaptopCode", description: "With proficiency in HTML, CSS, JavaScript, and React, I create visually appealing and user-friendly frontend experiences that adapt smoothly across devices. My focus is on building responsive and interactive interfaces that enhance user engagement.." },
    { title: "Backend Develop", icon: "FaDatabase", description: "Skilled in MongoDB and MySQL, I specialize in backend development. I handle data storage, retrieval, and manipulation, building efficient backend systems for web applications." },
    { title: "UI/UX Design", icon: "FaPenNib", description: "With a deep understanding of user-centered design principles, I specialize in creating exceptional UI/UX experiences. I collaborate closely with developers and conduct user research to ensure designs meet user needs." },
    { title: "Mobile App development", icon: "FaAndroid", description: "With a deep understanding of user-centered design principles, I specialize in crafting outstanding UI/UX experiences. I closely collaborate with developers and conduct user research to create mobile applications that are not only functional but also intuitive and engaging." },
    { title: "Software development", icon: "FaCogs", description: "With specialized skills in MongoDB and MySQL, I excel in backend development, efficiently handling data storage, retrieval, and manipulation. I create robust and scalable backend systems for web applications, ensuring seamless performance and reliability." },
];

const profileData = {
    greeting: "Hello, It's Me...",
    name: "Anushanga Munasinghe",
    jobTitles: ["Frontend Developer", "Backend Developer", "UI/UX Designer", "Mobile App Developer", "Software Developer"],
    intro: "Welcome to my portfolio! I'm a full-stack developer, UI/UX designer and Mobile app developer passionate about crafting exceptional digital experiences. Browse through my work and discover my expertise in front-end development and design. Let's create something extraordinary together!",
    resumeUrl: "/Anushanga Munasinghe CV.pdf",
    aboutHeading: "About Me",
    aboutParagraphs: [
        "I am a skilled and versatile professional in full-stack development and UI/UX design. With a passion for creating innovative digital solutions, I excel at transforming complex concepts into visually appealing and user-friendly experiences. My expertise includes HTML, CSS, JavaScript, PHP, ReactJS, and frameworks. I take pride in delivering high-quality code that exceeds expectations and am adept at problem-solving.",
        "Beyond my technical skills, I am a talented artist, architect, photographer, etc. and a very active citizen in the arts. I share my artistic knowledge and insights extensively with my full-stack development and UI/UX design. My strong aim is to provide maximum satisfaction to my clients through web development and design along with my artistic knowledge and technical knowledge.",
        "I am enthusiastic about collaborating with like-minded individuals and contributing my expertise to craft exceptional web experiences that captivate and engage users. By attending conferences and workshops, I stay up-to-date with the latest industry trends and continuously enhance my skills.",
    ],
    social: {
        facebook: "https://web.facebook.com/anushanga.kawshan.1",
        whatsapp: "https://wa.me/qr/PNKZI5JKCMJKK1",
        github: "https://github.com/AMunasinghe2001",
        linkedin: "https://www.linkedin.com/in/anushanga-munasinghe-9b51882a2/",
    },
    footerTagline: "A focused Web Developer building the Websites and Web Applications that lead to the success of the overall product",
    copyrightName: "Anushanga Munasinghe",
};

// ---- Seed helpers -------------------------------------------------------------
async function seedCollection(name, Model, buildDocs) {
    const count = await Model.countDocuments();
    if (count > 0 && !FORCE) {
        console.log(`• ${name}: ${count} existing doc(s) — skipped (use --force to replace).`);
        return;
    }
    if (FORCE) await Model.deleteMany({});
    const docs = await buildDocs();
    await Model.insertMany(docs);
    console.log(`✅ ${name}: inserted ${docs.length} doc(s).`);
}

(async () => {
    try {
        await connectDB();
        console.log(
            cloudinaryEnabled
                ? "Cloudinary configured — images will be uploaded."
                : "⚠ Cloudinary NOT configured — images will be left blank. Add keys to .env and re-run with --force to upload them."
        );

        // ---- Profile (singleton) ----
        const existingProfile = await Profile.findOne();
        if (existingProfile && !FORCE) {
            console.log("• Profile: already exists — skipped (use --force to replace).");
        } else {
            if (FORCE) await Profile.deleteMany({});
            const heroImage = await uploadImage("Home/img/pic.png");
            const aboutImage = await uploadImage("About/img/aboutPic.png");
            await Profile.create({ ...profileData, heroImage, aboutImage });
            console.log("✅ Profile: created.");
        }

        // ---- Projects ----
        await seedCollection("Projects", Project, async () => {
            const docs = [];
            for (let i = 0; i < projectData.length; i++) {
                const p = projectData[i];
                docs.push({
                    title: p.title,
                    technology: p.technology,
                    url: p.url,
                    image: await uploadImage(p.img),
                    order: i,
                });
            }
            return docs;
        });

        // ---- Skills ----
        await seedCollection("Skills", Skill, async () =>
            skillData.map((s, i) => ({ ...s, order: i }))
        );

        // ---- Journey ----
        await seedCollection("Journey", Journey, async () => {
            const docs = [];
            for (let i = 0; i < journeyData.length; i++) {
                const j = journeyData[i];
                docs.push({
                    title: j.title,
                    duration: j.duration,
                    institution: j.institution,
                    logo: await uploadImage(j.img),
                    order: i,
                });
            }
            return docs;
        });

        // ---- Services ----
        await seedCollection("Services", Service, async () =>
            serviceData.map((s, i) => ({ ...s, order: i }))
        );

        console.log("\n🎉 Seeding complete.");
    } catch (err) {
        console.error("❌ seed failed:", err);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
})();
