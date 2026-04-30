# Zoo Library

West Point cadet test archive — browse and upload old tests to help others study.

## Live site
`https://finlayrussell317.github.io/zoo-library`

---

## Setup Guide

### Step 1 — Create the Microsoft Form

1. Go to [forms.microsoft.com](https://forms.microsoft.com) and sign in with your West Point account
2. Click **New Form** and name it "Zoo Library — Test Upload"
3. Add these fields:
   - **Course Name** (Text, required)
   - **Year** (Text or dropdown, required)
   - **Your Name** (Text, optional — label it "Optional: leave blank to stay anonymous")
   - **Upload your test** (File upload, required — allow PDF, images, Word docs)
4. Click **Share** → **Embed** → copy the URL from the `src=""` part of the iframe code
5. Open `upload.html` in this repo and replace `REPLACE_WITH_YOUR_FORM_ID` in the iframe `src` with your URL

### Step 2 — Set up OneDrive/SharePoint folder

1. In your West Point OneDrive, create a folder called `Zoo Library`
2. Inside it, create two subfolders: `Pending` and `Published`
3. Microsoft Forms will automatically save uploads to your OneDrive — check Forms settings to confirm the folder

**Your workflow as moderator:**
- **Named uploads** → move straight to `Published`, then add to `data.js`
- **Anonymous uploads** → open in Preview/Acrobat, redact the name, save, move to `Published`, then add to `data.js`

### Step 3 — Deploy to GitHub Pages

1. Go to [github.com](https://github.com) and sign in
2. Click **New repository**, name it `zoo-library`, make it **Public**
3. Upload all files from this folder to the repo
4. Go to **Settings** → **Pages** → Source: **Deploy from a branch** → Branch: `main` → Folder: `/ (root)`
5. Click Save — your site will be live at `https://finlayrussell317.github.io/zoo-library` within a minute

---

## Adding a test to the site

When you're ready to publish an approved test:

1. Get the shareable OneDrive link for the file (right-click → Share → "Anyone with the link can view")
2. Open `data.js`
3. Add an entry at the top of the `TESTS` array:

```js
{
  id: 4,                                    // next number in sequence
  course: "EV350: Environmental Science",   // course code + name
  year: "2024",                             // year
  type: "PDF",                              // PDF, IMG, or DOC
  url: "https://usarmywestpoint.sharepoint.com/...", // OneDrive share link
  uploader: "CDT Russell"                   // or "Anonymous"
},
```

4. Save `data.js`, commit, and push — the site updates automatically

---

## File structure

```
zoo-library/
├── index.html    — browse page
├── upload.html   — upload page (embeds Microsoft Form)
├── style.css     — all styles
├── browse.js     — search + filter logic
├── data.js       — test entries (you edit this to publish tests)
└── README.md     — this file
```
