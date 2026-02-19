
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
