import { GoogleGenAI } from "@google/genai";
import { fetchTranscript } from "@/lib/youtube-transcript";
import { generatePDF } from "@/lib/pdf-generator";

interface Book {
    id: string;
    content: string;
    pdf: string;
    title: string;
}

export const resolvers = {
    Query: {
        _dummy: () => "This is a dummy query",
    },
    Mutation: {
        generateBook: async (_:any, { youtubeUrl }: { youtubeUrl: string }): Promise<Book> => {
            // Debug logging
            console.log('Environment variables check:');
            console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
            console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);

            if (!youtubeUrl) {
                throw new Error('YouTube URL is required');
            }

            if (!youtubeUrl.includes('youtube.com/watch')) {
                throw new Error('Invalid YouTube URL format. Please provide a valid YouTube video URL');
            }

            try {
                // Fetch transcript and video info
                console.log('Fetching transcript for:', youtubeUrl);
                const videoInfo = await fetchTranscript(youtubeUrl);
                
                if (!videoInfo.transcript || videoInfo.transcript.trim().length === 0) {
                    throw new Error('Failed to fetch transcript or transcript is empty');
                }

                // Check for API key
                if (!process.env.GEMINI_API_KEY) {
                    throw new Error("GEMINI_API_KEY is not defined in the environment variables. Please check your .env.local file.");
                }

                // Initialize Gemini AI
                console.log('Initializing Gemini AI');
                const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                const model = genAI.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: `Transform this YouTube transcript into an engaging book chapter. Follow these guidelines:

1. Write in a professional, engaging book style that flows naturally
2. Create proper paragraphs and sections with clear transitions
3. Use descriptive language and storytelling techniques
4. Maintain the original message but make it more literary and engaging
5. Add appropriate headings and subheadings to organize the content
6. Include a brief introduction and conclusion
7. Use varied sentence structures and rich vocabulary
8. Make it feel like a well-written book chapter, not a transcript
9. Keep all the important information but present it in a more engaging way
10. Ensure the content is easy to read and understand
11. DO NOT add any chapter numbers or "Chapter X" in the text
12. DO NOT include the video title in the content - it will be added separately
13. Focus on transforming the content into a flowing narrative

Video Title: ${videoInfo.title}
Channel: ${videoInfo.channelTitle}

Here's the transcript to transform:
${videoInfo.transcript}

Please transform this into a well-structured book chapter that captures the essence while being engaging and professional. Remember: DO NOT add chapter numbers or include the video title in the content.`
                });

                // Generate content
                console.log('Generating book content');
                const result = await model;
                const content = result.text;

                if (!content || content.trim().length === 0) {
                    throw new Error('Failed to generate book content');
                }

                // Clean up the content to remove any unwanted chapter numbers
                const cleanedContent = content
                    .replace(/Chapter\s+\d+/gi, '')
                    .replace(/^\d+\.\s*/gm, '')
                    .trim();

                // Generate PDF
                console.log('Generating PDF');
                const pdf = await generatePDF(cleanedContent, `${videoInfo.title} - ${videoInfo.channelTitle}`);

                return {
                    id: Date.now().toString(),
                    content: cleanedContent,
                    pdf: pdf,
                    title: `${videoInfo.title} - ${videoInfo.channelTitle}`
                };
            } catch (error) {
                console.error('Error in generateBook:', error);
                if (error instanceof Error) {
                    throw new Error(`Failed to generate book: ${error.message}`);
                }
                throw new Error('An unexpected error occurred while generating the book');
            }
        }
    }
}