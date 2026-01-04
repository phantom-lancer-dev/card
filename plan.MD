# CardSnap Project Plan & Status

## 1. Current State of the Application
CardSnap is a local-first, Progressive Web App (PWA)-ready solution built with React 19, Tailwind CSS, and the Google GenAI SDK. It focuses on a minimal "Swiss Style" aesthetic with high-contrast typography and fluid animations.

### Architecture & Core Technology
- **State Management:** React `useState` and `useEffect` drive local state. Data persistence is handled via browser `localStorage` (CRUD operations in `storageService.ts`).
- **AI Integration:** The app uses `@google/genai` (Gemini Flash 1.5/2.0 models) to process Base64 images. It utilizes "Structured Output" (JSON Schema) to force the AI to return strictly formatted contact data (Arrays for phones/emails, nullable strings for others).
- **Styling:** Tailwind CSS (v3) is now installed as a dependency (native build) replacing the CDN, ensuring offline functionality. A custom Tailwind configuration defines the Zinc-based neutral palette and fonts.
- **Mobile/Native:** Capacitor (Android) has been initialized to wrap the web app into a native APK. GitHub Actions is configured to build the APK automatically.

### Key Features & UX Patterns
#### Smart Card UI:
- **Expandable Cards:** Cards do not flip or scroll internally. Tapping a card expands it vertically using CSS Grid transitions (`grid-template-rows`) to reveal Notes and Tags.
- **Swipe Gestures:** Implemented via `TouchEvents`. Swipe Left to Delete, Swipe Right to Edit. Visual feedback layers appear behind the card during the swipe.
- **Dynamic Actions:** Phone numbers and Emails are interactive (`tel:`, `mailto:`) and render as lists. Long Website URLs break gracefully (`break-all`).
- **Randomized Accents:** A hashing function generates a consistent accent color (side strip) based on the contact's ID/Name to aid visual differentiation.

#### Data Handling:
- **Multi-Value Support:** The data model supports multiple phone numbers and email addresses per contact.
- **Migration System:** A `migrateCard` function runs on load to convert legacy data (strings) into the new array format automatically.
- **Alphabetical Indexing:** Contacts are grouped by the first letter of their name, with a sticky sidebar index for quick navigation.

#### Editing & Capture:
- **Camera:** Uses HTML5 file input with `capture="environment"` for native mobile camera access.
- **Deep Editing:** A modal allows adding/removing multiple phone numbers/emails and managing tags.
- **Quick Notes:** The "Notes" field in the expanded view is an editable textarea that autosaves on blur, facilitating quick updates during calls.

#### Settings & BYOK:
- Users can input their own Google Gemini API Key.
- The app validates the key by making a small test request before saving it to `localStorage`.

## 2. Infrastructure
- **Build System:** Vite.
- **CI/CD:** GitHub Actions workflow (`.github/workflows/build.yml`) compiles the Android APK.