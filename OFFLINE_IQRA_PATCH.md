# Offline Iqro' Patch — Rumah Tahfidz LMS

Date: 2026-08-19

This patch makes Iqro' a real third assessment mode instead of treating it as legacy Nuroniyyah data.

## What changed

- Assessment modes are now `ZIYADAH`, `NURONIYYAH`, and `IQRA`.
- Ziyadah progress is counted in Quran lines (`Zi +x`).
- Nuroniyyah progress is counted in lines (`Nur +x`).
- Iqro' progress is counted in pages (`Iq +x`).
- Teacher assessment UI now has a dedicated Iqro' tab with Jilid 1–6, start page, and end page.
- Iqro' page gain is calculated as an inclusive page range and can be stored in `iqra_pages_added`.
- Teacher workspace, optimistic UI, history modal, public progress view, mock API, and Apps Script backend all keep the three progress categories separate.
- Executive analytics backend now exposes a separate Iqro' statistics object rather than mixing Iqro' into Ziyadah/Nuroniyyah.
- Existing target logic is intentionally unchanged: NON_BBL displays Nuroniyyah target; BBL/BBLS/blank displays Ziyadah target.

## Spreadsheet compatibility

No destructive migration is required.

Existing Iqro' fields in `13_SESSION_ASSESSMENTS` are reused:

- `iqra_level`
- `iqra_page_start`
- `iqra_page_end`

Recommended new header:

- `iqra_pages_added`

If `iqra_pages_added` is missing or blank, the backend derives the page count from the page range, so old records still work.

## Deployment order

1. Add the optional `iqra_pages_added` header to `13_SESSION_ASSESSMENTS`.
2. Replace Apps Script `Code.gs` with `apps-script/Code.gs` from this package.
3. Deploy a **new version of the existing Apps Script deployment** so the `/exec` URL stays stable.
4. Push the frontend package to the active Git repo and let Vercel rebuild.
5. Test one Ziyadah record, one Nuroniyyah record, and one Iqro' record.
6. Confirm the Halaqah table can show a mixed example such as `Zi +8 • Nur +5 • Iq +3`.
7. Run `backendSelfCheckGS()` in Apps Script and inspect the log.

## Important semantic rule

`skill_status_start` and `assessment_mode` are different concepts. A student's skill status must never be used as the filter for statistical inclusion. Statistics are categorized by the actual `assessment_mode` stored on each assessment record.
