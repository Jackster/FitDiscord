# FitDiscord Video Compressor

A static browser app that transcodes a local video to H.264/AAC MP4 and verifies the output against Discord's 19,800,000-byte target. Processing uses WebCodecs through Mediabunny; the source file is read locally from a Blob and is never uploaded.

## Privacy

There is no backend, account system, analytics, or upload endpoint. The app does not transmit filenames or media content. Compression runs in a dedicated worker in the browser. Static site resources are the only network requests. The original file is downloaded directly when it already fits with the default settings.

## Browser support

The app feature-detects WebCodecs and Mediabunny encoder support. Current Chrome and Edge are the primary targets. AAC encoding and codec availability depend on the browser and operating system; Firefox and desktop Linux may lack native AAC encoding. Browsers without the required decoder/encoder report an actionable message. Browser/device combinations still need manual validation before making broader compatibility claims.

## Development

```bash
npm install
npm run dev
```

## Build and tests

```bash
npm test
npm run build
npm run preview
```

## Deployment

Push to `main` to run tests and build, then deploy the static `dist` directory to GitHub Pages with the official Pages Actions. In the repository settings, select **Pages → Build and deployment → GitHub Actions**. Vite uses relative asset paths so the build works at both a repository subpath and a custom domain root.

## Architecture

- Vite and TypeScript provide the static app and worker bundle.
- Mediabunny reads media from a `BlobSource`, performs WebCodecs decoding/resizing/encoding, and muxes MP4.
- The worker keeps media work off the UI thread; the UI can cancel it by terminating the worker.
- The encoder uses an initial duration-based bitrate budget and re-encodes over-target results at a corrected bitrate. A result is reported as successful only if its actual Blob size is at most 19,800,000 bytes.
- The output buffer is bounded by the target range. Mediabunny reads the source lazily with a bounded source cache; it does not copy the entire input into a WASM filesystem.

## Manual test checklist

- [ ] H.264 1080p MP4 and 4K MP4
- [ ] HEVC phone video, 720p, vertical, and 60 FPS videos
- [ ] Video with AAC audio and video with no audio
- [ ] Short clip, 30+ minute video, and source already below 19.8 MB
- [ ] Very large source file (multi-GB, where device capacity permits)
- [ ] Each resolution choice (Original, 1080p, 720p, 360p) with audio kept and removed
- [ ] Cancel an encode, then start another encode
- [ ] Inspect output playback, exact file size, and browser network panel
- [ ] Load the site, disable network, compress, and download
- [ ] Check desktop, tablet, mobile, and a backgrounded tab

Automated unit tests cover bitrate budgets, retry adjustment, byte formatting, and resolution fitting. No real-video or cross-device encode test has been performed as part of this setup.
