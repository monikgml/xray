# questionnaire

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_A2cdqiScBqJ4IpSymjvfYNtHbt5w)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## GitHub Pages Deployment

This project is a Next.js app, so GitHub Pages must deploy the built static output, not the repository root.

Use this repository setting:

```text
Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

Do not use `Deploy from a branch` with `main / root` for this app. In branch mode, GitHub Pages serves files directly from the selected branch folder. Since the repository root contains this `README.md`, GitHub may render the README with Jekyll instead of serving the app.

The GitHub Actions workflow in `.github/workflows/deploy.yml` runs:

```bash
pnpm build
```

That creates the static site in:

```text
out/
```

The workflow then uploads `out/` to GitHub Pages. For this Next.js app:

```text
Branch mode serves: README.md from the repo root
Actions mode serves: out/index.html from the Next.js build
```

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
