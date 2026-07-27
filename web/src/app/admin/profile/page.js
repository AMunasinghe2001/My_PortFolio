"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, Message, Panel, Grid2, Hint } from "@/components/admin/ui";
import styles from "./profile.module.css";

const splitLines = (str) =>
  (str || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

const EMPTY = {
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

export default function ProfileEditorPage() {
  const [form, setForm] = useState(EMPTY);
  const [heroFile, setHeroFile] = useState(null);
  const [aboutFile, setAboutFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = useCallback(() => {
    api
      .get("/profile")
      .then((res) => {
        const p = res.data?.profile || {};
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
  }, []);

  useEffect(load, [load]);

  const change = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

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

      // The public site reads this cache first on load; drop it so the new
      // images/text appear immediately instead of after the next fetch.
      localStorage.removeItem("profileCache");

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
    <>
      <PageHeader
        title="Profile & Hero"
        subtitle="The headline content shown across the home, about and footer sections."
      />
      <Message msg={msg} />

      {loading ? (
        <p className={styles.loading}>Loading…</p>
      ) : (
        <form onSubmit={submit}>
          <Panel title="Home / Hero">
            <Grid2>
              <div className="field">
                <label htmlFor="greeting">Greeting</label>
                <input id="greeting" type="text" name="greeting" value={form.greeting} onChange={change} />
              </div>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" type="text" name="name" value={form.name} onChange={change} />
              </div>
            </Grid2>

            <div className="field">
              <label htmlFor="jobTitles">Job titles</label>
              <textarea id="jobTitles" name="jobTitles" value={form.jobTitles} onChange={change} />
              <span className="hint">One per line — these animate in the hero.</span>
            </div>

            <div className="field">
              <label htmlFor="intro">Intro paragraph</label>
              <textarea id="intro" name="intro" value={form.intro} onChange={change} />
            </div>

            <Grid2>
              <div className="field">
                <label>Hero image</label>
                {form.heroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.heroImage} alt="Current hero" className={styles.preview} />
                ) : (
                  <div className={styles.previewEmpty}>No image yet</div>
                )}
                <input type="file" accept="image/*" onChange={(e) => setHeroFile(e.target.files[0])} />
              </div>

              <div className="field">
                <label htmlFor="resumeUrl">Resume (PDF)</label>
                <input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files[0])} />
                <input
                  id="resumeUrl"
                  type="text"
                  name="resumeUrl"
                  value={form.resumeUrl}
                  onChange={change}
                  placeholder="…or paste a resume URL"
                />
                {form.resumeUrl && (
                  <a className={styles.link} href={form.resumeUrl} target="_blank" rel="noreferrer">
                    Open current resume ↗
                  </a>
                )}
              </div>
            </Grid2>
          </Panel>

          <Panel title="About">
            <div className="field">
              <label htmlFor="aboutHeading">About heading</label>
              <input id="aboutHeading" type="text" name="aboutHeading" value={form.aboutHeading} onChange={change} />
            </div>

            <div className="field">
              <label htmlFor="aboutParagraphs">About paragraphs</label>
              <textarea
                id="aboutParagraphs"
                name="aboutParagraphs"
                value={form.aboutParagraphs}
                onChange={change}
                style={{ minHeight: 170 }}
              />
              <span className="hint">One paragraph per line.</span>
            </div>

            <div className="field" style={{ maxWidth: 380 }}>
              <label>About image</label>
              {form.aboutImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.aboutImage} alt="Current about" className={styles.preview} />
              ) : (
                <div className={styles.previewEmpty}>No image yet</div>
              )}
              <input type="file" accept="image/*" onChange={(e) => setAboutFile(e.target.files[0])} />
            </div>
          </Panel>

          <Panel title="Social links & footer">
            <Grid2>
              <div className="field">
                <label htmlFor="facebook">Facebook URL</label>
                <input id="facebook" type="text" name="facebook" value={form.social.facebook} onChange={changeSocial} />
              </div>
              <div className="field">
                <label htmlFor="whatsapp">WhatsApp URL</label>
                <input id="whatsapp" type="text" name="whatsapp" value={form.social.whatsapp} onChange={changeSocial} />
              </div>
              <div className="field">
                <label htmlFor="github">GitHub URL</label>
                <input id="github" type="text" name="github" value={form.social.github} onChange={changeSocial} />
              </div>
              <div className="field">
                <label htmlFor="linkedin">LinkedIn URL</label>
                <input id="linkedin" type="text" name="linkedin" value={form.social.linkedin} onChange={changeSocial} />
              </div>
            </Grid2>

            <div className="field">
              <label htmlFor="footerTagline">Footer tagline</label>
              <textarea id="footerTagline" name="footerTagline" value={form.footerTagline} onChange={change} />
            </div>

            <div className="field">
              <label htmlFor="copyrightName">Copyright name</label>
              <input id="copyrightName" type="text" name="copyrightName" value={form.copyrightName} onChange={change} />
            </div>
          </Panel>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save Profile"}
          </button>
          <Hint>Your GitHub-generated skills are not affected by this form.</Hint>
        </form>
      )}
    </>
  );
}
