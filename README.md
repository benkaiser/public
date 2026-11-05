# cdn.benkaiser.dev

This repository publishes files at **https://cdn.benkaiser.dev**.

## Publish a file

1. Add the file anywhere under [`files/`](files/).
2. Commit and push to `main`.
3. The `Deploy public files` GitHub Actions workflow publishes it.

The directory structure becomes the URL structure. For example:

| Repository path | Public URL |
| --- | --- |
| `files/example.apk` | `https://cdn.benkaiser.dev/example.apk` |
| `files/guides/setup.html` | `https://cdn.benkaiser.dev/guides/setup.html` |
| `files/notes.md` | `https://cdn.benkaiser.dev/notes.md` and `https://cdn.benkaiser.dev/notes.html` |

All file types are copied without modification. Markdown files are also rendered to styled HTML during CI while the original Markdown remains downloadable. A generated home page lists every published file.

If both `name.md` and `name.html` exist in the same directory, the handwritten HTML file wins and the generated Markdown page is omitted.

## Local preview

```sh
npm ci
npm run build
python3 -m http.server --directory _site 8000
```

Then open <http://localhost:8000>.

### Comp calculator

The single-page calculator is at `/comp-calculator/`. Its baseline figures are
for 2026. It adjusts the $400,000
four-day baseline for workdays, a 15-30% switching premium, and an additive 10%
strict-in-office loading. Annual benefits and donation matching offset pay
dollar for dollar against the current $5,000 and $23,350 values. The matching
slider sets the annual employer match, which is always used in full and
supported by at least the same amount of personal donations. Personal giving
scales from current donations with the change in pay before matching adjustments.
Increasing matching initially preserves that offer's giving target by reducing
pay and personal donations together. Once contributions are equal, each extra
$1 of matching increases pay and personal donations by $1, and total giving by
$2. Extra funding is itemised in the breakdown. This is a pre-tax comparison;
tax, superannuation differences, leave entitlements and other employer matching
eligibility rules are not modelled.

**Salary Minimum** selects the matching amount that minimizes pay for the
current settings, limited to the slider's $300,000 maximum. Settings persist
in this browser's local storage; **Reset** restores and saves the defaults.

Run its calculation checks with
`node --test tests/comp-calculator.test.js`.

## Domain and DNS

The Pages custom domain is `cdn.benkaiser.dev`. Configure this record with the DNS provider for `benkaiser.dev`:

| Type | Name/host | Value |
| --- | --- | --- |
| `CNAME` | `cdn` | `benkaiser.github.io` |

Do not use a wildcard record. After DNS propagation and certificate provisioning, enable **Enforce HTTPS** in the repository's Pages settings. DNS changes and certificate issuance can take up to 24 hours.
