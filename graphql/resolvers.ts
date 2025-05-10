import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchTranscript } from "@/lib/youtube-transcript";
import { generatePDF } from "@/lib/pdf-generator";

interface Book {
    id: string;
    content: string;
    pdf: string;
}

export const resolvers = {
    Mutation: {
        generateBook: async (_:any, { youtubeUrl }: { youtubeUrl: string }): Promise<Book> => {
            try{
                const transcript = await fetchTranscript(youtubeUrl);
                
                if (!process.env.GEMINI_API_KEY) {
                    throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
                }
                const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAi.getGenerativeModel({model: "gemini"});

                const prompt =`Ubah transcript youtube berikut menjadi seperti narasi buku yang menarik dan mudah dipahami. gunakan gaya penulisan seperti menulis buku personal development. hidnari kalimat pendek dan kata-kata seperti 'katanya'. Transcript: ${transcript}`;

                const result = await model.generateContent(prompt);
                const content = result.response.text();
                const pdf = await generatePDF(content);

                return {id: Date.now().toString(), content, pdf};
            } catch (error) {
                throw new Error(`Failed to generate book: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    }
}