# X Vibe Check (x-roaster)

A Nuxt 3 application that uses OpenAI to "roast" Twitter/X profiles based on user-provided content.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file in the root directory and add your OpenAI API key:
    ```env
    OPENAI_API_KEY=sk-proj-your-key-here...
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Features

-   **Roast API**: Server-side API (`/api/roast`) that uses GPT-4o-mini to generate sarcastic profiles.
-   **Frontend**: Tailwind CSS styled interface with "hacker" aesthetic.
-   **Image Generation**: Uses `html2canvas` to save the roast as an image.
-   **Confetti**: Celebration effect on successful roast.

## Tech Stack

-   Nuxt 3
-   Tailwind CSS
-   OpenAI API
-   Vue 3
