# public.benkaiser.dev

This repository publishes files at **https://public.benkaiser.dev**.

## Publish a file

1. Add the file anywhere under [`files/`](files/).
2. Commit and push to `main`.
3. The `Deploy public files` GitHub Actions workflow publishes it.

The directory structure becomes the URL structure. For example:

| Repository path | Public URL |
| --- | --- |
| `files/example.apk` | `https://public.benkaiser.dev/example.apk` |
| `files/guides/setup.html` | `https://public.benkaiser.dev/guides/setup.html` |
| `files/notes.md` | `https://public.benkaiser.dev/notes.md` and `https://public.benkaiser.dev/notes.html` |

All file types are copied without modification. Markdown files are also rendered to styled HTML during CI while the original Markdown remains downloadable. A generated home page lists every published file.

If both `name.md` and `name.html` exist in the same directory, the handwritten HTML file wins and the generated Markdown page is omitted.

## Local preview

```sh
npm ci
npm run build
python3 -m http.server --directory _site 8000
```

Then open <http://localhost:8000>.

## Domain and DNS

The Pages custom domain is `public.benkaiser.dev`. Configure this record with the DNS provider for `benkaiser.dev`:

| Type | Name/host | Value |
| --- | --- | --- |
| `CNAME` | `public` | `benkaiser.github.io` |

Do not use a wildcard record. After DNS propagation, GitHub Pages can provision and enforce HTTPS. DNS changes can take up to 24 hours.

