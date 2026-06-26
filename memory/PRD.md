# Alberto 100 Carris — PRD

A cinematic, bilingual (PT/EN) Expo React Native app documenting Alberto's once-in-a-lifetime train journey from Lagos (Portugal) to Singapore — more than 20,000 km, 16 countries, a dream forty years in the making.

## Tech Stack
- **Frontend**: Expo SDK 54, React Native, expo-router, expo-image, expo-linear-gradient, expo-blur, expo-secure-store, expo-haptics
- **Backend**: FastAPI + Motor (MongoDB), JWT (python-jose), bcrypt (passlib)
- **Auth**: Single admin user (`alberto` / `lagos2026`), JWT in expo-secure-store

## Visual Identity
Deep navy (#050B14) + champagne gold (#E6C365) + ivory white. Cormorant Garamond / Georgia display serif paired with DM Sans / Helvetica. Full-bleed cinematic photography with gradient scrims.

## Implemented Features
- **Home**: Hero with train window photo, brand mark, "Começar a viagem" CTA, story + purpose sections, quick navigation grid
- **Rota (Route)**: Vertical timeline of all 16 countries connected by a golden rail line with dashed markers for the Georgia air link; each country card tappable → detail
- **Country detail**: Hero image, flag, cities, curiosities (numbered, editorial)
- **Diário (Diary)**: Editorial list of entries (date, title, location, distance) loaded from backend; pull-to-refresh; FAB to add new (admin only)
- **New entry / Entry detail**: Full editor (protected), public read of detail with photos and metadata
- **More**: Stats dashboard (km, days, countries, cities, trains, hours) computed live from backend; links to History, Gallery, Videos, Equipment, About; Login/Logout
- **Login**: Username/password, JWT persisted in SecureStore
- **History**, **Gallery** (2-col mosaic from country images), **Videos** (episode placeholders), **Equipment**, **About me**
- **Language toggle PT/EN** persistent across sessions (AsyncStorage)
- **Tabs**: Home / Rota / Diário / Mais with blurred glass tab bar
- Bottom-tab navigation, safe-area aware headers, keyboard avoiding views, haptics on key interactions

## Mocked / Placeholder
- Photographs use Unsplash/Pexels URLs (MOCK images — to be replaced with real photos as the journey progresses)
- Sample diary entries are seeded on first backend startup
- Video page shows episode tiles without actual video playback (placeholders)

## Future Enhancements
- Image picker + real photo uploads (base64 or S3)
- Live geolocation capture in the diary editor
- Push notifications when a new entry is published
- Native interactive map (react-native-maps) with animated route polyline
