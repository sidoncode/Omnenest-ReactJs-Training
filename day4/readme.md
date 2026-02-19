
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

```tsx

const [wishlist, setWishlist] = useState<string[]>(() => {
  const saved = localStorage.getItem('wishlist');
  return saved ? JSON.parse(saved) : [];
});

useEffect(() => {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}, [wishlist]);
```
