import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const distDir = path.resolve(process.cwd(), "dist");

const files = [
  { html: "cv-pt.html", pdf: "cv-pt.pdf" },
  { html: "cv-en.html", pdf: "cv-en.pdf" },
  { html: "cv-dados.html", pdf: "cv-dados.pdf" },
  { html: "cv-dados-sem-foto.html", pdf: "cv-dados-sem-foto.pdf" },
  { html: "cv-dados-en.html", pdf: "cv-dados-en.pdf" },
  { html: "cv-dados-en-sem-foto.html", pdf: "cv-dados-en-sem-foto.pdf" },
];

for (const { html: htmlFile, pdf: pdfFile } of files) {
  const distHtml = path.join(distDir, htmlFile);
  if (!fs.existsSync(distHtml)) {
    console.error(`${htmlFile} não existe. Rode: npm run build`);
    process.exit(1);
  }
}

const browser = await chromium.launch();

for (const { html: htmlFile, pdf: pdfFile } of files) {
  const distHtml = path.join(distDir, htmlFile);
  const outPdf = path.join(distDir, pdfFile);
  const html = fs.readFileSync(distHtml, "utf8");
  const baseUrl = `file://${distDir}/`;

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load", baseURL: baseUrl });
  await page.pdf({
    path: outPdf,
    format: "A4",
    printBackground: true,
    margin: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
  });
  await page.close();
  console.log(`Gerado: dist/${pdfFile}`);
}

await browser.close();
