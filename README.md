# Visualizations

Open `index.html` in a browser. No installation, build step, or internet connection is required.

For an HTTP preview, run `python3 -m http.server 8000` from this folder and visit http://localhost:8000.

## Subjects

- **leftist heap merge** — generate two heaps, merge their right paths, and step through child swaps and rank updates. Use Previous/Next or drag the timeline; Play runs at the selected speed. Play at the end replays the same heaps.

- **skew heap merge** — open `skew-heap-merge/index.html` or follow the main index. Step through root comparisons, argument exchanges, right-subtree detachments, attachments, and child swaps. The second argument wins ties. A root with no right child attaches the other heap on the right and returns immediately. Use Play or drag the timeline to revisit any step.

- **quicksort** — enter 1–12 comma-separated integers or generate a random array. Follow comparisons, animated swaps, and recursive calls with Previous/Next, Play, or the timeline. The partition uses the rightmost pivot and groups equal values on its left.

- **hash table collisions** — load up to 15 integer keys, select chaining, linear probing, or double hashing, and step through insertions into seven buckets. Changing the strategy replays the loaded keys from an empty table.

- **Schwarz–Christoffel transformation** — open `schwarz-christoffel/index.html` directly or follow the main index. Select a label on either graph to highlight its partner and read its coordinates and angle. Use **+ Add / edit** to add or remove finite prevertices, set their angles in units of π, and edit the constants or base prevertex. Enter the argument of C₁ in units of π, such as `1/2` or `0.5` for π/2. The example starts with a square. The last prevertex is at infinity and its angle follows from the polygon angle sum. The plotted corners use numerical boundary integration. The editor accepts 2–10 finite prevertices and angles from 0.05π to 1.95π, and checks the computed boundary for self-intersections.

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
