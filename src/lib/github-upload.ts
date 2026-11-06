const GITHUB_API = "https://api.github.com";

/**
 * Hostinger deploys this app by cloning the repo fresh from GitHub on every
 * push — anything saved to the local filesystem outside of git (like a file
 * uploaded live through the site) is wiped the next time someone deploys any
 * unrelated code change. This commits every upload straight into the repo
 * (same path it's saved locally under `public/`) so it survives deploys
 * automatically, the same way the course-content PDFs already do.
 *
 * Requires a GITHUB_TOKEN env var (a GitHub Personal Access Token with repo
 * write access) — without it, this silently no-ops and uploads keep working
 * exactly as before, just without the automatic GitHub backup.
 */
export async function backupUploadToGitHub(publicPath: string, buffer: Buffer): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn(
      `[github-upload] GITHUB_TOKEN not set — skipping GitHub backup for ${publicPath}. ` +
        "This file will be lost on the next deploy unless committed manually."
    );
    return;
  }

  const owner = process.env.GITHUB_REPO_OWNER || "learnbeingforward";
  const repo = process.env.GITHUB_REPO_NAME || "learnbeingforward";
  const branch = process.env.GITHUB_REPO_BRANCH || "main";
  // publicPath is like "/uploads/content/abc-file.pdf" — the repo path is the
  // same thing under public/, with no leading slash.
  const repoPath = `public${publicPath}`;

  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURI(repoPath)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Upload ${repoPath} via admin panel`,
        content: buffer.toString("base64"),
        branch,
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[github-upload] Failed to back up ${repoPath} to GitHub: ${res.status} ${body}`);
    return;
  }

  console.log(`[github-upload] Backed up ${repoPath} to GitHub.`);
}
