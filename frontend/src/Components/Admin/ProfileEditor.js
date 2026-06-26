import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminNav from "./AdminNav";
import "./admin.css";

const splitLines = (str) =>
  (str || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

const emptyForm = {
  greeting: "",
  name: "",
  jobTitles: "",
  intro: "",
  aboutHeading: "",
  aboutParagraphs: "",
  resumeUrl: "",
  footerTagline: "",
  copyrightName: "",
  social: { facebook: "", whatsapp: "", github: "", linkedin: "" },
  heroImage: "",
  aboutImage: "",
};

const ProfileEditor = () => {
  const [form, setForm] = useState(emptyForm);
  const [heroFile, setHeroFile] = useState(null);
  const [aboutFile, setAboutFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    api
      .get("/profile")
      .then((res) => {
        const p = res.data.profile || {};
        setForm({
          greeting: p.greeting || "",
          name: p.name || "",
          jobTitles: (p.jobTitles || []).join("\n"),
          intro: p.intro || "",
          aboutHeading: p.aboutHeading || "",
          aboutParagraphs: (p.aboutParagraphs || []).join("\n"),
          resumeUrl: p.resumeUrl || "",
          footerTagline: p.footerTagline || "",
          copyrightName: p.copyrightName || "",
          social: {
            facebook: p.social?.facebook || "",
            whatsapp: p.social?.whatsapp || "",
            github: p.social?.github || "",
            linkedin: p.social?.linkedin || "",
          },
          heroImage: p.heroImage || "",
          aboutImage: p.aboutImage || "",
        });
      })
      .catch(() => setMsg({ type: "error", text: "Failed to load profile." }))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const changeSocial = (e) =>
    setForm((f) => ({ ...f, social: { ...f.social, [e.target.name]: e.target.value } }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("greeting", form.greeting);
      fd.append("name", form.name);
      fd.append("intro", form.intro);
      fd.append("aboutHeading", form.aboutHeading);
      fd.append("resumeUrl", form.resumeUrl);
      fd.append("footerTagline", form.footerTagline);
      fd.append("copyrightName", form.copyrightName);
      fd.append("jobTitles", JSON.stringify(splitLines(form.jobTitles)));
      fd.append("aboutParagraphs", JSON.stringify(splitLines(form.aboutParagraphs)));
      fd.append("social", JSON.stringify(form.social));
      if (heroFile) fd.append("heroImage", heroFile);
      if (aboutFile) fd.append("aboutImage", aboutFile);
      if (resumeFile) fd.append("resume", resumeFile);

      await api.put("/profile", fd);
      setHeroFile(null);
      setAboutFile(null);
      setResumeFile(null);
      setMsg({ type: "success", text: "Profile saved successfully." });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Save failed." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-container">
        <h1 className="admin-title">Profile & Hero</h1>
        {msg && <div className={`admin-msg ${msg.type}`}>{msg.text}</div>}
        {loading ? (
          <p>Loading…</p>
        ) : (
          <form onSubmit={submit}>
            {/* Hero */}
            <div className="admin-form">
              <h2>Home / Hero</h2>
              <div className="admin-grid-2">
                <div className="admin-field">
                  <label>Greeting</label>
                  <input type="text" name="greeting" value={form.greeting} onChange={change} />
                </div>
                <div className="admin-field">
                  <label>Name</label>
                  <input type="text" name="name" value={form.name} onChange={change} />
                </div>
              </div>
              <div className="admin-field">
                <label>Job titles (one per line — these animate in the hero)</label>
                <textarea name="jobTitles" value={form.jobTitles} onChange={change} />
              </div>
              <div className="admin-field">
                <label>Intro paragraph</label>
                <textarea name="intro" value={form.intro} onChange={change} />
              </div>
              <div className="admin-grid-2">
                <div className="admin-field">
                  <label>Hero image</label>
                  {form.heroImage && <img src={form.heroImage} alt="hero" className="admin-thumb" />}
                  <input type="file" accept="image/*" onChange={(e) => setHeroFile(e.target.files[0])} />
                </div>
                <div className="admin-field">
                  <label>Resume (PDF) — upload or paste a URL below</label>
                  <input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files[0])} />
                  <input type="text" name="resumeUrl" value={form.resumeUrl} onChange={change} placeholder="Resume URL" style={{ marginTop: 8 }} />
                </div>
              </div>
            </div>

            {/* About */}
            <div className="admin-form">
              <h2>About</h2>
              <div className="admin-field">
                <label>About heading</label>
                <input type="text" name="aboutHeading" value={form.aboutHeading} onChange={change} />
              </div>
              <div className="admin-field">
                <label>About paragraphs (one paragraph per line)</label>
                <textarea name="aboutParagraphs" value={form.aboutParagraphs} onChange={change} style={{ minHeight: 160 }} />
              </div>
              <div className="admin-field">
                <label>About image</label>
                {form.aboutImage && <img src={form.aboutImage} alt="about" className="admin-thumb" />}
                <input type="file" accept="image/*" onChange={(e) => setAboutFile(e.target.files[0])} />
              </div>
            </div>

            {/* Social + footer */}
            <div className="admin-form">
              <h2>Social links & footer</h2>
              <div className="admin-grid-2">
                <div className="admin-field">
                  <label>Facebook URL</label>
                  <input type="text" name="facebook" value={form.social.facebook} onChange={changeSocial} />
                </div>
                <div className="admin-field">
                  <label>WhatsApp URL</label>
                  <input type="text" name="whatsapp" value={form.social.whatsapp} onChange={changeSocial} />
                </div>
                <div className="admin-field">
                  <label>GitHub URL</label>
                  <input type="text" name="github" value={form.social.github} onChange={changeSocial} />
                </div>
                <div className="admin-field">
                  <label>LinkedIn URL</label>
                  <input type="text" name="linkedin" value={form.social.linkedin} onChange={changeSocial} />
                </div>
              </div>
              <div className="admin-field">
                <label>Footer tagline</label>
                <textarea name="footerTagline" value={form.footerTagline} onChange={change} />
              </div>
              <div className="admin-field">
                <label>Copyright name</label>
                <input type="text" name="copyrightName" value={form.copyrightName} onChange={change} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileEditor;
