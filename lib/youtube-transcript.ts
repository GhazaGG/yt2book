import { YoutubeTranscript } from "youtube-transcript";

export const fetchTranscript = async (url: string): Promise<string> => {
    const transcript = await YoutubeTranscript.fetchTranscript(url);
    return transcript.map(entry => entry.text).join(' ')
}