# QuizForge ⚡

AI-powered Kahoot-style quiz generator from your study notes. Upload PDFs, PowerPoints, Word docs, or text files and get an interactive timed quiz instantly.

## Features

- **Multi-format support** — ZIP archives containing PDFs, PPTX, DOCX, TXT, MD files
- **AI-generated questions** — Mix of multiple choice + true/false using Claude
- **Timed gameplay** — Configurable countdown per question (10–45s)
- **Scoring system** — Base points + time bonus + streak multiplier
- **Instant feedback** — Explanations for every answer
- **Full review** — See all questions and answers at the end

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up your API key (free)

Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey), then:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your key:

```
GEMINI_API_KEY=your-key-here
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **Upload** — Drop a ZIP file (or individual PDF/PPTX/DOCX) with your study materials
2. **Configure** — Choose number of questions, time limit, and difficulty
3. **Play** — Answer questions against the clock, build streaks for bonus points
4. **Review** — See your score breakdown and review every question

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Gemini 2.0 Flash (free tier) for quiz generation
- pdf-parse, officeparser, mammoth for document extraction
- JSZip for archive handling

## Scoring

| Component | Points |
|-----------|--------|
| Correct answer | 500 |
| Time bonus | Up to 500 (based on remaining time) |
| Streak bonus | 100 per consecutive correct (max 5x) |
