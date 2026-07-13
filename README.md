# CloudExify Project 2 — E-Commerce Product Page

## Student Information

**Name:** Ahsen Bilal  
**Registration Number:** CX-2026-XXXX  
**Project Name:** E-Commerce Product Page  
**Repository Name:** CloudExify-Project-2  
**Project Type:** Interactive Frontend Application  
**Deployment:** Vercel  

> Replace `CX-2026-XXXX` with your actual registration number before final submission.

---

## Live Links

**GitHub Repository:** https://github.com/ahsenbilal19/CloudExify-Project-2  
**Live Vercel Link:** Add your live Vercel URL here after deployment.

---

## Build Track / Store Concept

**Selected Drop Concept:** Sneaker Drop  

This project is designed as a **Limited Drop Storefront** for sneakers. The storefront simulates a real sneaker launch where users can browse limited products, track stock, add items to cart, and complete a simulated checkout.

---

## Technologies Used

- HTML5
- CSS3
- Bootstrap 5 CDN
- Vanilla JavaScript
- localStorage
- Vercel Deployment

---

## Key New Concept

The main concept used in this project is:

**Dynamic DOM rendering from data + persistent state**

All products are stored inside `js/data.js` and product cards are generated dynamically using JavaScript. The shopping cart is saved inside `localStorage`, so the cart stays available even after refreshing the page.

---

## Mandatory Drop Mechanics Implemented

### 1. Countdown Timer

A live countdown timer is displayed in the hero section. It updates every second and changes cleanly when the drop time reaches zero.

### 2. Live Stock Indicator

Every product card shows the remaining stock. When a user adds a product to the cart, the displayed stock decreases immediately. If stock reaches zero, the product button becomes disabled and shows `Sold Out`.

### 3. Persistent Cart

The cart uses `localStorage`, so products remain in the cart after page refresh. Quantity changes and removals also update localStorage.

### 4. Search + Filter

The page includes combined filtering using:

- Search bar
- Category filter
- Price range filter
- Rating filter
- Sort dropdown

All filters work together on the same product dataset.

---

## Additional Features

- Product detail modal using Bootstrap
- Shopping cart offcanvas
- Add/remove/update quantity controls
- Total price calculation
- Discount code feature using `DROP10`
- Checkout form with Bootstrap validation
- Toast notification on add/remove/cart actions
- Dark/light mode toggle saved with localStorage
- Responsive Bootstrap product grid
- Custom product SVG images

## Design Polish

- Premium type system: Space Grotesk (display), Inter (body), JetBrains Mono (labels/prices/countdown)
- Product ribbons: **Bestseller** (rating 4.8+), **Low Stock** (≤3 left), **Sold Out**
- Trust bar under the hero (secure checkout, shipping, returns, live stock)
- Navbar shrinks and gains contrast on scroll
- Product cards fade/slide in on scroll (respects `prefers-reduced-motion`)
- Open Graph / Twitter meta tags and an inline SVG favicon for shareability
- Skip-to-content link and visible focus states for keyboard accessibility

---

## Folder Structure

```text
CloudExify-Project-2/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── data.js
│   └── script.js
├── assets/
│   ├── products/
│   └── screenshots/
└── README.md
```

---

## How to Run Locally

Open `index.html` directly in your browser or use VS Code Live Server.

No npm installation is required because Bootstrap is loaded through CDN.

---

## Deployment Steps on Vercel

1. Create a public GitHub repository named exactly:

```text
CloudExify-Project-2
```

2. Push this project code to the repository.

3. Go to Vercel and click **Add New Project**.

4. Import the `CloudExify-Project-2` repository.

5. Framework preset: **Other**.

6. Leave build command and output directory empty.

7. Click **Deploy**.

8. Copy your live `.vercel.app` link and add it to this README.

---

## Screenshots

Add at least two screenshots inside:

```text
assets/screenshots/
```

Required screenshots:

- Desktop screenshot
- Mobile screenshot

Recommended file names:

```text
assets/screenshots/desktop.png
assets/screenshots/mobile.png
```

---

## Testing Checklist

| Test Case | Expected Result | Status |
|---|---|---|
| Open live Vercel link | Store loads correctly | Pending |
| Countdown timer | Counts down every second | Pending |
| Add to cart | Stock decreases correctly | Pending |
| Refresh page | Cart remains saved | Pending |
| Remove item | Cart and stock update | Pending |
| Change quantity | Total recalculates | Pending |
| Search products | Product grid filters live | Pending |
| Category + price + rating filters | Combined filters work correctly | Pending |
| Product modal | Correct product details show | Pending |
| Checkout form validation | Invalid fields show errors | Pending |
| Mobile layout | Bootstrap grid adapts cleanly | Pending |
| Browser console | No JavaScript errors | Pending |

---

## Final Submission Message

```text
[CX-2026-XXXX] Web Project 2 Done — GitHub: https://github.com/ahsenbilal19/CloudExify-Project-2 | Live: [your Vercel link]
```