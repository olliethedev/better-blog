# better-blog

WIP

## Features

- [ ] 

## Development Workflow

### Prerequisites

Install [yalc](https://github.com/wclr/yalc) globally for better local package linking:

```bash
npm install -g yalc
```

### Setting Up Local Development

1. **Clone and setup the library**:
```bash
git clone <repo-url>
cd better-blog
pnpm install
pnpm build
yalc publish
```

2. **Create test applications** (recommended):
```bash
# Next.js (SSR/SSG testing)
pnpm dlx shadcn@latest init

# Vite React (Client-only testing)  
# todo


```

3. **Link the library to test apps**:
```bash
# In each test application
cd your-test-app
yalc add better-blog
pnpm install


# Repeat for other test apps
```

### Development Loop

1. **Start the library in watch mode**:
```bash
cd better-blog
pnpm dev
```
This will:
- Watch for file changes
- Rebuild the library automatically
- Push changes to all linked test applications

2. **Start your test applications** (in separate terminals):
```bash
# Terminal 2: Next.js test
cd ../your-test-app
npm run dev

# Terminal 3: Vite test  
#todo
```

3. **Make changes**: Edit files in `src/`. The library will automatically rebuild and update in all linked test applications with hot reload.

### Testing Across Frameworks

Your test applications should verify:

**Server-Side Rendering (Next.js/Remix)**:
- Components render correctly on the server
- Proper hydration on the client
- No browser-only APIs in server components

**Client-Side Only (Vite/CRA)**:
- Components work without SSR
- Bundle size is reasonable
- Tree-shaking works correctly

### Scripts

- `pnpm dev` - Watch mode with auto-push to linked projects
- `pnpm build` - Production build
- `pnpm prepublishOnly` - Clean build before publishing (runs automatically)

### Publishing

When ready to publish:
```bash
# Version bump
npm version patch # or minor/major

# Publish (prepublishOnly script runs automatically)
npm publish
```

### Troubleshooting

**Library not updating in test apps?**
- Run `yalc push` manually from the library directory
- Check that `yalc add better-blog` was run in test apps
- Restart the test application dev server

**Build issues?**
- Clear dist: `rm -rf dist && pnpm build`
- Check TypeScript errors: `tsc --noEmit`

## License

This project is licensed under the MIT License. See the LICENSE file for details.
