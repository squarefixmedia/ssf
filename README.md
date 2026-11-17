# Stepping Stone Foundation — website

Static website (HTML, CSS and plain JavaScript — no build step) for Stepping Stone Foundation, Nagpur.

## Pages
| File | Page |
|---|---|
| `index.html` | Home |
| `about.html` | About — story, values, vision/mission/goal, inspiration, founder, governance |
| `impact.html` | Impact — stories, women's handmade products, focus areas |
| `gallery.html` | Gallery with full-screen photo viewer |
| `blog.html` | Blog / news |
| `donate.html` | Donate — amount, donor details form, Razorpay payment, bank & UPI details |

## How donations work
1. Donor picks an amount (or types their own).
2. Donor fills the **donor's details form** (name, mobile, email, address, state, city, PIN, country, PAN).
3. Details are emailed to the foundation, then the donor is sent to
   **https://razorpay.me/@steppingstonefoundation** with the amount to enter shown clearly.

Razorpay.me links do not accept a pre-filled amount, so the donor types the amount on Razorpay's page.

## Turn on form emails (one-time)
Forms send through [FormSubmit](https://formsubmit.co) to `mail@ssfnagpur.org` (set in `assets/js/config.js`).
- After the site is live, submit any form once. FormSubmit emails **mail@ssfnagpur.org** an activation link — click **Activate Form**.
- Optional: FormSubmit then shows a random alias. Put `https://formsubmit.co/ajax/<alias>` in `config.js` to hide the email address from the page source.
- If sending fails, visitors are shown the email address and a "Copy my details" button, so nothing is lost.

## Host on GitHub Pages
1. Create a new repository on GitHub (for example `ssf-website`).
2. Upload **everything in this folder** (keep the `assets` folder structure) — *Add file → Upload files*, then *Commit*.
3. Go to **Settings → Pages**, set *Source* to **Deploy from a branch**, choose `main` and `/ (root)`, and save.
4. The site goes live at `https://<your-username>.github.io/ssf-website/` within a minute or two.
5. Custom domain (e.g. `ssfnagpur.org`): in **Settings → Pages → Custom domain**, enter the domain, then add the DNS records GitHub shows at your domain registrar.

## Editing
- Text and images: edit the `.html` files directly.
- Colours and spacing: `assets/css/style.css` (colour variables are at the top).
- Razorpay link, form destination, contact email: `assets/js/config.js`.
- Replace images in `assets/img/` with the original high-resolution files, keeping the same file names.

## Report PDFs
Upload the files as `assets/docs/audit-report.pdf` and `assets/docs/annual-report.pdf`.
Until they exist, the site automatically shows them as "available on request" with an email link,
and switches to "View" as soon as the files are uploaded — no code change needed.
