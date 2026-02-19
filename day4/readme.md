
# Product Features Implementation Notes

## Feature 1 — useProductSearch

**Live search with 500ms debounce**

- Uses `useRef` to hold the debounce timer  
- Searches simultaneously across:  
  - Product **title**  
  - Product **description**  
  - Product **category**  
- Shows **"Searching..."** indicator while the debounce delay is active

Implementation pattern:
```tsx
const timer = useRef<NodeJS.Timeout | null>(null);
// ...
timer.current = setTimeout(() => {
  // perform search
}, 500);
```

</br>

## Feature 2 — useWishlist


## useWishlist Hook – Persistent Wishlist with localStorage

**Features & Implementation Details**

- **Storage**: Uses `localStorage` to persist the wishlist across sessions and page reloads
- **Initialization**:
  - Lazy initializer in `useState` → reads from localStorage **only once** on first mount
  - Avoids unnecessary reads on every render
- **Persistence**:
  - `useEffect` watches the wishlist state
  - Saves to localStorage **automatically on every change**
- **UI Integration**:
  - Adds a heart button (❤️ / 🤍) to each `ProductCard`
  - Toggles product in/out of wishlist on click
- **Event handling**:
  - `e.stopPropagation()` on heart button click
  - Prevents the parent card's click handler from firing
  - Stops unwanted navigation to product detail page when only toggling wishlist

### Code Pattern Example

```tsx
import { useState, useEffect } from 'react';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch (err) {
      console.error('Failed to save wishlist:', err);
    }
  }, [wishlist]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return { wishlist, toggleWishlist, isInWishlist };
}


```tsx

const [wishlist, setWishlist] = useState<string[]>(() => {
  const saved = localStorage.getItem('wishlist');
  return saved ? JSON.parse(saved) : [];
});

useEffect(() => {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}, [wishlist]);
```



# 🛍️ React E-Commerce — Easy Custom Hooks

> Step-by-step implementation for Features 3, 4, and 5

---

## Feature 3 — `useToggle` Boolean Toggle Hook

### What We're Building
A tiny reusable hook that manages any `true/false` state with a single `toggle()` function. We'll use it to add a **"Show Description"** toggle on each product card.

### Step 1 — Create the Hook

Create `src/hooks/useToggle.js`:

```js
// src/hooks/useToggle.js
import { useState } from 'react';

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = () => setValue(prev => !prev);

  return [value, toggle];
}
```

### Step 2 — Use it in ProductCard.jsx

Open `src/components/ProductCard.jsx` and add the toggle:

```jsx
// src/components/ProductCard.jsx
import { useToggle } from '../hooks/useToggle';

function ProductCard({ product, onViewDetails }) {
  const [showDesc, toggleDesc] = useToggle(false); // false = hidden by default

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px',
                  padding: '15px', background: 'white' }}>

      <img src={product.image} alt={product.title}
           style={{ width: '100%', height: '200px', objectFit: 'contain' }} />

      <h3 style={{ fontSize: '14px' }}>{product.title}</h3>
      <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#0066cc' }}>
        ${product.price}
      </p>

      {/* Toggle Button */}
      <button
        onClick={toggleDesc}
        style={{ padding: '6px 12px', marginBottom: '8px',
                 background: '#f0f0f0', border: '1px solid #ddd',
                 borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
      >
        {showDesc ? '▲ Hide Description' : '▼ Show Description'}
      </button>

      {/* Conditionally show description */}
      {showDesc && (
        <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.5' }}>
          {product.description}
        </p>
      )}

      <button onClick={() => onViewDetails(product.id)}
              style={{ width: '100%', padding: '10px', marginTop: '8px',
                       background: '#0066cc', color: 'white',
                       border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        View Details
      </button>
    </div>
  );
}

export default ProductCard;
```

### Step 3 — Test It

- Click **"▼ Show Description"** on any card → description appears
- Click **"▲ Hide Description"** → description collapses
- Each card has its own independent toggle state

---

## Feature 4 — Back to Top Button (`useScrollPosition`)

### What We're Building
A `useScrollPosition` hook that watches `window.scrollY`. Once the user scrolls past **300px**, a floating **"↑ Back to Top"** button appears in the bottom-right corner.

### Step 1 — Create the Hook

Create `src/hooks/useScrollPosition.js`:

```js
// src/hooks/useScrollPosition.js
import { useState, useEffect } from 'react';

export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener('scroll', handleScroll);

    // Cleanup: remove listener when component unmounts
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
}
```

### Step 2 — Create the BackToTop Component

Create `src/components/BackToTop.jsx`:

```jsx
// src/components/BackToTop.jsx
import { useScrollPosition } from '../hooks/useScrollPosition';

function BackToTop() {
  const scrollY = useScrollPosition();

  // Don't render the button until user scrolls past 300px
  if (scrollY < 300) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: '#0066cc',
        color: 'white',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: 999
      }}
      title="Back to top"
    >
      ↑
    </button>
  );
}

export default BackToTop;
```

### Step 3 — Add to App.jsx

```jsx
// src/App.jsx
import BackToTop from './components/BackToTop'; // <-- ADD

function App() {
  // ...existing code...

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Navbar onViewCart={handleViewCart} />

      {/* ...existing views... */}

      <BackToTop />  {/* <-- ADD at the bottom, outside all views */}
    </div>
  );
}
```

### Step 4 — Test It

- Open the app and scroll down past a few product rows
- The **↑** button appears in the bottom-right corner
- Click it — page smoothly scrolls back to the top
- Scroll back up — the button disappears automatically

---

## Feature 5 — `useWindowSize` Responsive Layout Hook

### What We're Building
A hook that tracks the browser window's `width` and `height`. We'll use it to automatically switch the product grid between **4 columns on desktop** and **1 column on mobile** — no CSS media queries needed.

### Step 1 — Create the Hook

Create `src/hooks/useWindowSize.js`:

```js
// src/hooks/useWindowSize.js
import { useState, useEffect } from 'react';

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
```

### Step 2 — Use it in ProductList.jsx

Open `src/components/ProductList.jsx` and use the hook to control grid columns:

```jsx
// src/components/ProductList.jsx
import { useWindowSize } from '../hooks/useWindowSize'; // <-- ADD

function ProductList({ onViewDetails }) {
  const { width } = useWindowSize(); // <-- ADD

  // Decide columns based on screen width
  const getGridColumns = () => {
    if (width < 480)  return '1fr';                          // Mobile
    if (width < 768)  return 'repeat(2, 1fr)';              // Tablet
    if (width < 1024) return 'repeat(3, 1fr)';              // Small desktop
    return 'repeat(auto-fill, minmax(220px, 1fr))';         // Large desktop
  };

  // ...existing state and fetch logic stays the same...

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Product Store</h1>

      {/* Optional: show current breakpoint during development */}
      <p style={{ fontSize: '12px', color: '#999' }}>
        Window width: {width}px
      </p>

      {/* Product Grid — now responsive via JS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: getGridColumns(), // <-- dynamic columns
        gap: '20px'
      }}>
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
}

export default ProductList;
```

### Step 3 — Test It

- Open DevTools → Toggle device toolbar (Ctrl+Shift+M)
- Resize the browser window and watch the grid columns change live
- **< 480px** → 1 column (phone)
- **480–768px** → 2 columns (tablet)
- **768–1024px** → 3 columns (small laptop)
- **> 1024px** → auto-fill columns (desktop)

---

## Summary

| Feature | Hook | Key Concepts |
|---|---|---|
| Toggle Description | `useToggle` | `useState`, function returned as toggle |
| Back to Top Button | `useScrollPosition` | `useEffect`, scroll event, cleanup |
| Responsive Grid | `useWindowSize` | `useEffect`, resize event, derived value |

> **Tip:** All three hooks follow the same pattern — set up an event listener inside `useEffect`, update state when the event fires, and clean up the listener on unmount.
