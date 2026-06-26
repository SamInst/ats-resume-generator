import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const templatePath = path.join(root, "templates", "ats.html");
const cssPath = path.join(root, "templates", "style.css");
const distDir = path.join(root, "dist");

fs.mkdirSync(distDir, { recursive: true });

const tpl = fs.readFileSync(templatePath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function summaryHtml(summary) {
  const paragraphs = Array.isArray(summary)
    ? summary
    : summary.split(/\n\n+/);
  return paragraphs
    .map((p) => `<p class="summary">${escapeHtml(p.trim())}</p>`)
    .join("\n");
}

function skillsHtml(skills) {
  return skills
    .map(
      (g) =>
        `<div class="item"><div class="item-title">${escapeHtml(g.group)}:</div> ${escapeHtml(
          g.items.join(", "),
        )}</div>`,
    )
    .join("\n");
}

function bulletsHtml(bullets) {
  return `<ul class="bullets">${bullets
    .map((b) => `<li>${escapeHtml(b)}</li>`)
    .join("")}</ul>`;
}

function projectsHtml(projects, techLabel) {
  return projects
    .map((p) => {
      const links = (p.links ?? [])
        .map(
          (l) =>
            `<li>${escapeHtml(l.label)}: <a href="${l.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(
              l.url,
            )}</a></li>`,
        )
        .join("");
      return `
<div class="item">
  <div class="item-title">${escapeHtml(p.title)}</div>
  <div class="tech-line">${escapeHtml(techLabel)}: ${escapeHtml(p.stack)}</div>
  ${bulletsHtml(p.bullets)}
  ${links ? `<ul class="bullets">${links}</ul>` : ""}
</div>`;
    })
    .join("\n");
}

function experienceHtml(exps) {
  return exps
    .map(
      (e) => `
<div class="item">
  <div class="item-header">
    <div>
      <div class="item-title">${escapeHtml(e.role)}</div>
      <div class="item-subtitle">${escapeHtml(e.company)}</div>
    </div>
    <div class="item-date">${escapeHtml(e.date)}</div>
  </div>
  ${bulletsHtml(e.bullets)}
</div>`,
    )
    .join("\n");
}

function educationHtml(eds) {
  return eds
    .map(
      (e) => `
<div class="item">
  <div class="item-header">
    <div>
      <div class="item-title">${escapeHtml(e.title)}</div>
      <div class="item-subtitle">${escapeHtml(e.subtitle)}</div>
    </div>
    <div class="item-date">${escapeHtml(e.date)}</div>
  </div>
</div>`,
    )
    .join("\n");
}

function photoHtml(photo) {
  if (!photo) return "";
  const imgPath = path.join(root, "data", photo);
  if (!fs.existsSync(imgPath)) {
    console.warn(`⚠️  Photo not found: data/${photo} — skipping image.`);
    return "";
  }
  const imgData = fs.readFileSync(imgPath);
  const base64 = imgData.toString("base64");
  const ext = path.extname(photo).toLowerCase().replace(".", "");
  const mime = ext === "jpg" ? "jpeg" : ext;
  return `<div class="header-photo"><img src="data:image/${mime};base64,${base64}" alt="Photo" /></div>`;
}

function languagesHtml(langs) {
  return langs
    .map(
      (l) => `
<div class="item">
  <div class="item-header">
    <div class="item-title">${escapeHtml(l.name)} — ${escapeHtml(l.level)}</div>
    <div class="item-date">${escapeHtml(l.note)}</div>
  </div>
</div>`,
    )
    .join("\n");
}

function renderResume(dataFile, outputFile) {
  const data = JSON.parse(
    fs.readFileSync(path.join(root, "data", dataFile), "utf8"),
  );
  const labels = data.labels;

  const html = tpl
    .replace(
      `<link rel="stylesheet" href="./style.css" />`,
      `<style>${css}</style>`,
    )
    .replaceAll("{{LANG}}", escapeHtml(labels.lang))
    .replaceAll("{{NAME}}", escapeHtml(data.name))
    .replaceAll("{{TITLE}}", escapeHtml(data.title))
    .replaceAll("{{EMAIL}}", escapeHtml(data.email))
    .replaceAll("{{PHONE_E164}}", escapeHtml(data.phone_e164))
    .replaceAll("{{PHONE_DISPLAY}}", escapeHtml(data.phone_display))
    .replaceAll("{{LOCATION}}", escapeHtml(data.location))
    .replaceAll("{{LINKEDIN_URL}}", data.linkedin_url)
    .replaceAll("{{GITHUB_URL}}", data.github_url)
    .replaceAll("{{WEBSITE_URL}}", data.website_url)
    .replaceAll("{{LINKEDIN_TEXT}}", "https://www.linkedin.com/in/samhelson-java/")
    .replaceAll("{{GITHUB_TEXT}}", "https://github.com/SamInst")
    .replaceAll("{{WEBSITE_TEXT}}", "")
    .replaceAll("{{LABEL_SUMMARY}}", escapeHtml(labels.summary))
    .replaceAll("{{LABEL_EXPERIENCE}}", escapeHtml(labels.experience))
    .replaceAll("{{LABEL_EDUCATION}}", escapeHtml(labels.education))
    .replaceAll("{{LABEL_LANGUAGES}}", escapeHtml(labels.languages))
    .replaceAll("{{LABEL_SKILLS}}", escapeHtml(labels.skills))
    .replaceAll("{{SUMMARY_HTML}}", summaryHtml(data.summary))
    .replaceAll("{{SKILLS_HTML}}", skillsHtml(data.skills))
    .replaceAll("{{EXPERIENCE_HTML}}", experienceHtml(data.experience))
    .replaceAll("{{EDUCATION_HTML}}", educationHtml(data.education))
    .replaceAll("{{LANGUAGES_HTML}}", languagesHtml(data.languages))
    .replaceAll("{{PHOTO_HTML}}", photoHtml(data.photo ?? ""));

  fs.writeFileSync(path.join(distDir, outputFile), html, "utf8");
  console.log(`Gerado: dist/${outputFile}`);
}

renderResume("resume.example.portuguese.json", "cv-pt.html");
renderResume("resume.example.english.json", "cv-en.html");
renderResume("resume.example.dados.json", "cv-dados.html");
renderResume("resume.example.dados.sem-foto.json", "cv-dados-sem-foto.html");
renderResume("resume.example.dados.english.json", "cv-dados-en.html");
renderResume("resume.example.dados.english.sem-foto.json", "cv-dados-en-sem-foto.html");
