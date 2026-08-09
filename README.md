# AI Engineering Blog

A lightweight Astro 7 technical blog designed for GitHub Pages and a custom domain.

The starter includes:

- Astro content collections for Markdown articles;
- a responsive home page, article index, article layout, and About page;
- RSS feed;
- XML sitemap through `@astrojs/sitemap`;
- basic SEO, Open Graph, canonical URLs, and `robots.txt`;
- GitHub Actions deployment to GitHub Pages;
- a finished first article on AI-assisted software development;
- a draft second article to demonstrate the publishing workflow.

## 1. Prerequisites

Install:

- Git
- Visual Studio Code
- Node.js 24 LTS (recommended for this repository)
- a GitHub account

Check:

```bash
node --version
git --version
```

## 2. Personalize the starter

Before publishing, search the entire repository for these placeholders:

```text
YOUR_GITHUB_USERNAME
YOUR NAME
blog.yourdomain.com
```

At minimum edit:

### `src/consts.ts`

Set:

- `AUTHOR_NAME`
- `GITHUB_URL`
- optionally `LINKEDIN_URL`
- optionally change `SITE_TITLE` and `SITE_DESCRIPTION`

### `astro.config.mjs`

For the first GitHub Pages deployment, set:

```js
site: 'https://YOUR_GITHUB_USERNAME.github.io'
```

Replace `YOUR_GITHUB_USERNAME` with your real GitHub username.

This starter assumes you create the special GitHub Pages repository named:

```text
YOUR_GITHUB_USERNAME.github.io
```

That choice intentionally avoids a `/repository-name` base path and makes the later switch to your custom domain simpler.

## 3. Install dependencies

From the project root:

```bash
npm install
```

This creates `package-lock.json`. **Commit the lockfile.** The official Astro GitHub Pages action detects the package manager from the lockfile.

## 4. Run locally

```bash
npm run dev
```

Open the local URL Astro prints, normally:

```text
http://localhost:4321
```

For a production check:

```bash
npm run build
npm run preview
```

## 5. Create the GitHub repository

On GitHub, create a new repository named exactly:

```text
YOUR_GITHUB_USERNAME.github.io
```

Recommended settings:

- Public repository if you use GitHub Free
- Do not initialize it with another README because this project already contains one

Then initialize and push this local project:

```bash
git init
git add .
git commit -m "Initial engineering blog"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_GITHUB_USERNAME.github.io.git
git push -u origin main
```

## 6. Enable GitHub Pages

In GitHub:

1. Open the repository.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Open the **Actions** tab.
5. Confirm the `Deploy to GitHub Pages` workflow succeeds.

The workflow is already included at:

```text
.github/workflows/deploy.yml
```

Your temporary site should become available at:

```text
https://YOUR_GITHUB_USERNAME.github.io
```

## 7. Connect your own domain

This starter is designed for a subdomain such as:

```text
blog.yourdomain.com
```

### 7A. Configure DNS at your domain provider

Create a CNAME record:

```text
Type:   CNAME
Name:   blog
Target: YOUR_GITHUB_USERNAME.github.io
```

The exact UI labels vary by registrar/DNS provider.

### 7B. Add the CNAME file

Rename:

```text
public/CNAME.example
```

to:

```text
public/CNAME
```

Then replace its contents with one line:

```text
blog.yourdomain.com
```

Do not include `https://` in the CNAME file.

### 7C. Update Astro's site URL

Change `astro.config.mjs` to:

```js
export default defineConfig({
  site: 'https://blog.yourdomain.com',
  integrations: [sitemap()],
});
```

Do **not** add a `base` value when using the custom domain.

### 7D. Configure the domain in GitHub

Go to:

**Repository → Settings → Pages → Custom domain**

Enter:

```text
blog.yourdomain.com
```

Save it. After DNS validation and certificate issuance, enable **Enforce HTTPS**.

### 7E. Verify the domain in GitHub

For better protection against domain takeover, also use GitHub's domain verification feature under your GitHub account/organization Pages settings and add the TXT record GitHub provides.

## 8. Publish a new article

Create a Markdown file inside:

```text
src/content/blog/
```

Example:

```markdown
---
title: "Your Article Title"
description: "One or two sentences for search engines and article cards."
pubDate: 2026-08-09
tags: ["Software Engineering", "AI"]
draft: false
featured: false
---

Your article starts here.
```

The filename becomes the article ID/URL. For example:

```text
src/content/blog/context-engineering.md
```

becomes:

```text
/blog/context-engineering/
```

Then publish with:

```bash
git add .
git commit -m "Publish context engineering article"
git push
```

The GitHub Action rebuilds and publishes the site automatically.

## 9. Draft workflow

Set:

```yaml
draft: true
```

while writing an article. Drafts are excluded from the home page, article index, static article routes, and RSS feed.

Change it to:

```yaml
draft: false
```

when ready to publish.

## 10. Make one post featured

Set:

```yaml
featured: true
```

The newest featured article appears in the large home-page card. If no post is marked as featured, the newest published article is used.

## 11. Useful commands

```bash
npm run dev      # local development
npm run build    # type/content check + production build
npm run preview  # preview production build locally
```

## 12. Recommended VS Code extensions

- Astro (official)
- GitHub Copilot / GitHub Copilot Chat if you use Copilot
- Markdown All in One (optional)

## 13. Suggested content roadmap

1. The mental model: IDE vs assistant vs agent vs LLM
2. Context engineering for coding agents
3. Repository instructions that actually work
4. Agentic coding: tools, terminals, and validation loops
5. Choosing models by task, latency, and cost
6. Designing repositories that are easier for agents to understand
7. AI-assisted code review
8. Rolling out AI-assisted development across an engineering team

## 14. Repository structure

```text
.
├── .github/workflows/deploy.yml
├── public/
│   ├── CNAME.example
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── components/
│   ├── content/blog/
│   ├── layouts/
│   ├── pages/
│   ├── styles/
│   ├── consts.ts
│   └── content.config.ts
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## 15. Before you announce the site

- Replace every placeholder.
- Rewrite the About page.
- Confirm the first article represents your own views and voice.
- Check all external links.
- Run `npm run build` with zero errors.
- Check mobile rendering.
- Confirm `/rss.xml` works.
- Confirm `/sitemap-0.xml` or the generated sitemap index is accessible after deployment.
- Configure custom-domain HTTPS.
- Verify the domain in GitHub.
- Add the site to Google Search Console if you want search analytics/indexing visibility.

## Technical baseline

This starter was prepared against the current Astro/GitHub Pages documentation in August 2026, using Astro 7.2.x, `@astrojs/rss` 4.0.19, `@astrojs/sitemap` 3.7.3, and the current official GitHub Pages action versions shown in Astro's deployment guide.
