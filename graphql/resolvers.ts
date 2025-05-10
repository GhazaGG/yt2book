import { GoogleGenAI } from "@google/genai";
import { fetchTranscript } from "@/lib/youtube-transcript";
import { generatePDF } from "@/lib/pdf-generator";

interface Book {
    id: string;
    content: string;
    pdf: string;
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
                // Fetch transcript
                console.log('Fetching transcript for:', youtubeUrl);
                const transcript = await fetchTranscript(youtubeUrl);
                
                if (!transcript || transcript.trim().length === 0) {
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
                    contents: `Ubah transcript youtube berikut menjadi seperti narasi buku yang menarik dan mudah dipahami. gunakan gaya penulisan seperti menulis buku personal development. hindari kalimat pendek dan kata-kata seperti 'katanya'. Transcript: ${transcript}`
                });

                // Generate content
                console.log('Generating book content');
                const result = await model;
                const content = result.text;

                if (!content || content.trim().length === 0) {
                    throw new Error('Failed to generate book content');
                }

                // Generate PDF
                console.log('Generating PDF');
                const pdf = await generatePDF(content);

                return {
                    id: Date.now().toString(),
                    content: content,
                    pdf: pdf
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