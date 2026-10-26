# SurgicGuide Mobile

Cross-platform iOS/Android application for the hypothetical SurgicGuide Limited academic project.

## Status

Version 1.0 is feature-complete at source-code level. It includes:

- Mobile home experience
- AI-integrated FLIM System content
- Science for Non-specialists
- FLIM for Cancer Surgery specialist content
- All 28 scientific references
- Our Team
- Clearly labelled simulated FLIM viewer
- iOS and Android application identifiers
- EAS preview and production build profiles
- Academic / non-clinical disclaimers throughout

The Product, Specialist and Non-specialist scientific wording is intentionally preserved from the SurgicGuide source website.

## Important status notice

SurgicGuide Limited is hypothetical. The AI-integrated FLIM System is hypothetical. This application is an academic and illustrative demonstration and is not a medical device. It must not be used for diagnosis, treatment, surgical guidance or clinical decision-making.

The interactive FLIM viewer uses simulated values only and does not ingest, process or classify patient data.

## Run locally

Install Node.js, then:

```bash
cd mobile-app
npm install
npm run doctor
npm start
```

Open the project with a compatible Expo development client / Expo Go environment, or launch an iOS/Android simulator.

## Production builds

EAS CLI and an Expo account are required:

```bash
npm install -g eas-cli
eas login
eas build:configure
npm run build:ios
npm run build:android
```

Store distribution additionally requires the owner's Apple Developer and/or Google Play Console accounts, signing credentials, store listing information, privacy disclosures and platform review.

## Release checklist

1. Run `npm install`.
2. Run `npm run doctor` and resolve any SDK compatibility warnings.
3. Test every screen on at least one current iPhone and one current Android device.
4. Confirm the remote Team image loads on production networks.
5. Create final app icon, adaptive Android icon and splash artwork before store submission.
6. Build iOS and Android production binaries with EAS.
7. Complete App Store / Play Store privacy and content questionnaires accurately.
8. Keep all academic, hypothetical and non-clinical disclosures visible in store copy and screenshots.
9. Do not describe the simulated FLIM viewer as a diagnostic or clinical function.
10. Submit signed builds through the owner's developer accounts.

## Architecture

The app deliberately uses a small dependency surface: Expo, React and React Native. The initial release is contained in `App.js` so the academic project remains easy to inspect and edit.

For a future production-scale product, split content, screens and design primitives into modules and add automated tests before introducing any networked accounts, data storage or real image-processing functionality.
