# Visualizations

Open `index.html` in a browser. No installation, build step, or internet connection is required.

For an HTTP preview, run `python3 -m http.server 8000` from this folder and visit http://localhost:8000.

## Subjects

- **leftist heap merge** — generate two heaps, merge their right paths, and step through child swaps and rank updates. Use Previous/Next or drag the timeline; Play runs at the selected speed. Play at the end replays the same heaps.

Run algorithm checks with `node --test tests/*.test.js`.

See `projectoverview.md` for architecture and `AGENTS.md` for contribution conventions.

## Deploy to GitHub Pages

1. Create an empty public GitHub repository named `visualizations` (do not initialize it with a README).
2. From this folder, run the following, replacing `YOUR_USERNAME`:

   ```sh
   git init -b main
   git add .
   git commit -m "Add interactive visualizations"
   git remote add origin https://github.com/YOUR_USERNAME/visualizations.git
   git push -u origin main
   ```

3. In the GitHub repository, open **Settings → Pages**. Select **Deploy from a branch**, choose **main** and **/(root)**, then **Save**.
4. Once deployment finishes, the site will be at `https://YOUR_USERNAME.github.io/visualizations/`. Check the repository's Actions tab for deployment progress.

The `.nojekyll` file keeps deployment static; no build is needed. Future commits pushed to `main` publish automatically. Relative links work under the repository URL.

Reference: [GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
