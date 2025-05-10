# YouTube to Book Converter

Transform YouTube videos into engaging narrative books using AI. This application takes a YouTube video URL, extracts its transcript, and uses Google's Gemini AI to convert it into a well-structured, engaging book chapter.

## 🚀 Features

- Convert YouTube videos to narrative books
- Extract video transcripts automatically
- AI-powered content transformation
- Generate professional PDF books
- Video preview with thumbnail
- Clean, modern UI

## 🛠️ Tech Stack

- **Frontend:**
  - Next.js 15
  - React 19
  - TailwindCSS
  - Apollo Client
  - File-Saver

- **Backend:**
  - Next.js API Routes
  - GraphQL
  - Apollo Server
  - Google Gemini AI
  - PDF-Lib

- **APIs:**
  - YouTube Data API (optional)
  - Google Gemini AI API
  - YouTube Transcript API

## 🏗️ Project Structure

```
yt2book/
├── app/                 # Next.js app directory
├── components/          # React components
├── graphql/            # GraphQL schema and resolvers
├── lib/                # Utility functions
│   ├── pdf-generator.ts
│   ├── youtube-transcript.ts
│   └── apollo-client.ts
└── public/             # Static assets
```

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your API keys:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   YOUTUBE_API_KEY=your_youtube_api_key  # Optional
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## 🔑 API Keys Required

- **Google Gemini AI API Key**: Required for content generation
- **YouTube API Key**: Optional, used for video details and preview

## 🎯 Current Status

- ✅ Basic video to book conversion
- ✅ PDF generation
- ✅ Video preview (when YouTube API key is available)
- ✅ Error handling and user feedback
- ✅ Responsive design

## 🚧 In Progress

- Improving error handling for missing transcripts
- Enhancing PDF formatting
- Optimizing AI prompts for better content generation

## 🔮 Future Features

- [ ] Multiple book format support (EPUB, MOBI)
- [ ] Custom book templates
- [ ] Batch processing of multiple videos
- [ ] User authentication
- [ ] Save and manage generated books
- [ ] Custom AI prompts
- [ ] Book cover generation
- [ ] Table of contents generation
- [ ] Chapter organization
- [ ] Export to different languages

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI for content generation
- YouTube Transcript API for video captions
- PDF-Lib for PDF generation
- Next.js team for the amazing framework
