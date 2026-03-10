# readme


# Jest Config Explained — `jest.config.js` vs `jest.config.ts`

---

## The Problem — Why We're Doing This

Jest is a **Node.js tool** and Node.js natively understands JavaScript (`.js`), not TypeScript (`.ts`).
When you name your config file `jest.config.ts`, Jest tries to read it but gets stuck — it can't understand TypeScript syntax on its own.

To read a `.ts` file, Jest needs a package called `ts-node` installed. We didn't install it, so it throws this error:

```
Error: Jest: 'ts-node' is required for TypeScript configuration files
```

**The simplest fix** — just use `jest.config.js` instead. No extra package needed.

---

## The Fix — Full Commands

```bash
# Inside your jest-demo folder — delete the old .ts config
rm jest.config.ts

# Create jest.config.js with this content:
cat > jest.config.js << 'EOF'
/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|svg|png|jpg)$': '<rootDir>/__mocks__/fileMock.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
  },
  coverageThreshold: {
    global: { branches: 70, functions: 75, lines: 75, statements: 75 },
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
};
module.exports = config;
EOF

# Now run tests
npm test
npm run test:watch
npm run test:coverage
```

---

## Line-by-Line Explanation

### `rm jest.config.ts`

Deletes the old TypeScript config file that was causing the error.

---

### `cat > jest.config.js << 'EOF' ... EOF`

This is a **heredoc** — a shell trick to create a file and write multiple lines into it in one command.
Everything between `<< 'EOF'` and `EOF` gets written into `jest.config.js`.
It's the same as opening VS Code and typing the file manually — just faster from the terminal.

---

### `/** @type {import('jest').Config} */`

```js
/** @type {import('jest').Config} */
```

A JSDoc comment that gives you TypeScript-style autocomplete in VS Code even though the file is `.js`.
It tells your editor *"treat this object as a Jest Config type."*
Purely optional, but helpful.

---

### `preset: 'ts-jest'`

```js
preset: 'ts-jest',
```

Tells Jest to use `ts-jest` as a pre-configured setup for TypeScript projects.
This handles compiling your `.ts` and `.tsx` files before running tests.

---

### `testEnvironment: 'jsdom'`

```js
testEnvironment: 'jsdom',
```

By default Jest runs in a pure Node.js environment — no `document`, no `window`, no DOM.
React components need those browser APIs. `jsdom` is a fake browser environment that provides them.

> ⚠️ Without this you'd get: `ReferenceError: document is not defined`

---

### `setupFilesAfterEnv`

```js
setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
```

Runs `setupTests.ts` once after Jest loads, before any test runs.
That file contains `import '@testing-library/jest-dom'` which adds extra matchers like `.toBeInTheDocument()`.

> ⚠️ Without this, matchers like `.toBeInTheDocument()` don't exist and your tests will fail.

---

### `moduleNameMapper`

```js
moduleNameMapper: {
  '\\.(css|less|scss|svg|png|jpg)$': '<rootDir>/__mocks__/fileMock.ts',
},
```

When your React components import CSS or image files like `import './App.css'`, Jest doesn't know
what to do with them — it only runs JS/TS.

This line intercepts those imports using a **regex** and replaces them with a dummy stub
(`fileMock.ts` just returns `'test-file-stub'`).

> ⚠️ Without this, Jest would crash on any CSS import.

---

### `transform`

```js
transform: {
  '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
},
```

Tells Jest: *"for any file ending in `.ts` or `.tsx`, use `ts-jest` to compile it first."*

The `jsx: 'react-jsx'` option tells the TypeScript compiler to understand JSX syntax (`<Counter />`)
and transform it into regular JavaScript function calls.

> ⚠️ Without this you'd get: `SyntaxError: unexpected token '<'`

---

### `coverageThreshold`

```js
coverageThreshold: {
  global: { branches: 70, functions: 75, lines: 75, statements: 75 },
},
```

Sets **minimum coverage gates**. If your tests cover less than these percentages,
`npm run test:coverage` will **fail** even if all individual tests pass.

This enforces code quality — especially useful in CI/CD pipelines.

> 💡 You can lower these numbers if you're just starting out.

---

### `collectCoverageFrom`

```js
collectCoverageFrom: [
  'src/**/*.{ts,tsx}',
  '!src/**/*.d.ts',
  '!src/main.tsx',
  '!src/vite-env.d.ts',
],
```

Tells Jest **which files to measure coverage on**.
Without this, Jest only measures files that were actually imported in tests —
missing files with zero coverage entirely.

| Pattern | Meaning |
|---|---|
| `src/**/*.{ts,tsx}` | Include all source files |
| `!src/**/*.d.ts` | Exclude TypeScript type declaration files (no runnable code) |
| `!src/main.tsx` | Exclude the app entry point (hard to test, just mounts React) |
| `!src/vite-env.d.ts` | Exclude Vite's auto-generated type file |

---

### `module.exports = config`

```js
module.exports = config;
```

The `.js` file uses **CommonJS exports** (`module.exports`) instead of ES Module syntax (`export default`).
Jest's config loader expects CommonJS.

> ⚠️ If you wrote `export default config` in a `.js` file, Jest would throw a syntax error.

---

## Summary Table

| Line | Why it's there |
|---|---|
| `rm jest.config.ts` | Remove the file Jest can't read |
| `cat > ... << EOF` | Shell shortcut to create a file from the terminal |
| `preset: 'ts-jest'` | Enables TypeScript support in Jest |
| `testEnvironment: 'jsdom'` | Gives tests a fake browser DOM |
| `setupFilesAfterEnv` | Loads jest-dom matchers before tests run |
| `moduleNameMapper` | Stops Jest crashing on CSS/image imports |
| `transform` | Compiles TSX files and enables JSX syntax |
| `coverageThreshold` | Enforces minimum test coverage percentages |
| `collectCoverageFrom` | Defines which files count toward coverage |
| `module.exports` | CommonJS export that Jest's config loader expects |

---

## Quick Comparison — `.ts` vs `.js` Config

| | `jest.config.ts` | `jest.config.js` |
|---|---|---|
| Needs `ts-node`? | ✅ Yes | ❌ No |
| Works out of the box? | ❌ No | ✅ Yes |
| TypeScript types/autocomplete? | ✅ Native | ✅ Via JSDoc comment |
| Recommended for this project? | ❌ | ✅ |



```

# Inside your jest-demo folder — delete the old .ts config
rm jest.config.ts

# Create jest.config.js with this content:
cat > jest.config.js << 'EOF'
/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|svg|png|jpg)$': '<rootDir>/__mocks__/fileMock.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
  },
  coverageThreshold: {
    global: { branches: 70, functions: 75, lines: 75, statements: 75 },
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
};
module.exports = config;
EOF

# Now run tests
npm test
npm run test:watch
npm run test:coverage

```





