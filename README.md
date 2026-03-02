# App Store PWA

A self-hosted Progressive Web App for distributing Android apps via GitHub Releases.

## Features

- **No backend required** - Uses GitHub Releases for APK hosting
- **PWA support** - Install on home screen, works offline
- **Mobile-optimized** - Responsive design for phones and tablets
- **QR code sharing** - Easy mobile access from desktop
- **Filtering** - View stable releases or betas separately
- **GitHub Actions ready** - Auto-deploy to GitHub Pages

## Quick Start

### 1. Install Dependencies

```bash
cd app-store-pwa
npm install
```

### 2. Configure

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your GitHub repository details:

```env
VITE_GITHUB_OWNER=your-username
VITE_GITHUB_REPO=your-repo-name
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment

### GitHub Pages

1. Enable GitHub Pages in your repository settings
2. Deploy the `dist/` folder to the `gh-pages` branch:

```bash
npm run build
# Use gh-pages CLI or GitHub Actions to deploy
```

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy PWA

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Creating Releases

Use the provided script to create GitHub releases with APK files:

```bash
# Basic usage
./scripts/create-release.sh path/to/app.apk

# With specific version
./scripts/create-release.sh path/to/app.apk v1.0.0

# Full options
./scripts/create-release.sh path/to/app.apk v1.0.0 "My App v1.0.0" "Release notes here"
```

### Prerequisites

- Install [GitHub CLI](https://cli.github.com/): `brew install gh` (macOS)
- Authenticate: `gh auth login`
- Git repository with remote origin configured

## Configuration

### Via Environment Variables

Set these in `.env` during development:

- `VITE_GITHUB_OWNER` - GitHub username or organization
- `VITE_GITHUB_REPO` - Repository name
- `VITE_GITHUB_TOKEN` - Optional, for higher API rate limits

### Via App Settings

Users can configure their own GitHub repository in the app's Settings page. Configuration is stored locally.

## GitHub Releases Structure

Each release represents an app version:

```
Release: MyApp v1.0.0
Tag: v1.0.0
Assets:
  - myapp-v1.0.0.apk (the APK file)
Description:
  - Release notes
  - Changelog
```

The app will:
1. Fetch all releases from the repository
2. Extract APK files from release assets
3. Display each release as an installable app

## Project Structure

```
app-store-pwa/
├── src/
│   ├── components/        # Vue components
│   │   ├── AppCard.vue    # App listing card
│   │   ├── AppDetail.vue  # App details modal
│   │   ├── QRCode.vue     # QR code generator
│   │   └── InstallButton.vue
│   ├── composables/
│   │   └── useGitHub.ts   # GitHub API integration
│   ├── views/
│   │   ├── HomeView.vue   # Main app list
│   │   └── SettingsView.vue
│   ├── router/
│   │   └── index.ts       # Vue Router config
│   ├── App.vue
│   └── main.ts
├── public/
│   ├── manifest.json      # PWA manifest
│   └── icon.svg           # App icon
├── scripts/
│   └── create-release.sh  # Release helper script
└── vite.config.ts         # Vite + PWA config
```

## Rate Limits

GitHub API has rate limits:
- Unauthenticated: 60 requests/hour
- Authenticated (with token): 5000 requests/hour

If you hit limits, add `VITE_GITHUB_TOKEN` to your `.env` file.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Mobile browsers (Chrome Android, Safari iOS)

## License

MIT
