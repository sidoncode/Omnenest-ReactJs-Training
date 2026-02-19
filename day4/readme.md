
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


}
```

### Step 2 — Create the BackToTop Component

Create `src/components/BackToTop.jsx`:

```jsx
// src/components/BackToTop.jsx
import { useScrollPosition } from '../hooks/useScrollPosition';


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
