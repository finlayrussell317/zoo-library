// ── Zoo Library — Test Data ──────────────────────────────────
//
// HOW TO ADD A TEST:
// When you approve an upload, add an entry to this array below.
// Then commit and push to GitHub — the site updates automatically.
//
// Fields:
//   id       — unique number, just increment each time
//   course   — course code + name (e.g. "MA206: Probability & Statistics")
//   year     — academic year as a string (e.g. "2024")
//   type     — file type: "PDF", "IMG", or "DOC"
//   url      — the direct SharePoint/OneDrive share link to the file
//   uploader — name of uploader, or "Anonymous"
//
// Example entry:
// {
//   id: 1,
//   course: "MA206: Probability & Statistics",
//   year: "2023",
//   type: "PDF",
//   url: "https://usarmywestpoint.sharepoint.com/...",
//   uploader: "CDT Smith"
// },

const TESTS = [

  // ── Add approved tests below this line ──────────────────

  // ── Example entries (delete these when you have real ones) ──
  {
    id: 1,
    course: "MA371",
    year: "2026",
    type: "PDF",
    url: "https://usarmywestpoint-my.sharepoint.com/personal/finlay_russell_westpoint_edu/Documents/Apps/Microsoft%20Forms/Zoo%20library%20upload%20form/Question/WPR.3_Finlay%20Russell.pdf",
    uploader: "Anonymous"
  },
  {
    id: 2,
    course: "CH101: General Chemistry",
    year: "2023",
    type: "PDF",
    url: "#",
    uploader: "CDT Johnson"
  },
  {
    id: 3,
    course: "PL100: Military Leadership",
    year: "2024",
    type: "IMG",
    url: "#",
    uploader: "Anonymous"
  },

];
