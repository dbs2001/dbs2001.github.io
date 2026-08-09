# Setup checklist

Use this file as the shortest path from ZIP file to live website.

## Local

- [ ] Extract the project.
- [ ] Open it in VS Code.
- [ ] Replace `YOUR_GITHUB_USERNAME` everywhere.
- [ ] Replace `YOUR NAME` in `src/consts.ts`.
- [ ] Customize the site title/description if desired.
- [ ] Edit `src/pages/about.astro`.
- [ ] Review the first article in `src/content/blog/`.
- [ ] Run `npm install`.
- [ ] Run `npm run dev`.
- [ ] Run `npm run build`.

## GitHub

- [ ] Create `YOUR_GITHUB_USERNAME.github.io` repository.
- [ ] Commit `package-lock.json` together with the project.
- [ ] Push `main`.
- [ ] Set Pages source to **GitHub Actions**.
- [ ] Confirm the deployment action is green.
- [ ] Open `https://YOUR_GITHUB_USERNAME.github.io`.

## Custom domain

- [ ] Add DNS CNAME `blog` → `YOUR_GITHUB_USERNAME.github.io`.
- [ ] Rename `public/CNAME.example` → `public/CNAME`.
- [ ] Put only `blog.yourdomain.com` inside `public/CNAME`.
- [ ] Set Astro `site` to `https://blog.yourdomain.com`.
- [ ] Push changes.
- [ ] Add the custom domain in GitHub Pages settings.
- [ ] Enable **Enforce HTTPS** when available.
- [ ] Verify your domain in GitHub using GitHub's TXT-record instructions.

## Publish workflow

- [ ] Add `.md` file under `src/content/blog/`.
- [ ] Use `draft: true` while writing.
- [ ] Set `draft: false` to publish.
- [ ] `git add .`
- [ ] `git commit -m "Publish <article>"`
- [ ] `git push`
