# Architecture

`files/` is the only public content source. `scripts/build.mjs` copies its contents to `_site/`, renders each Markdown file to a sibling HTML file, and creates a file index. The build also adds `CNAME` and `.nojekyll`.

`.github/workflows/pages.yml` runs that build and deploys `_site/` with GitHub's official Pages actions. `_site/` is generated and is not committed.

