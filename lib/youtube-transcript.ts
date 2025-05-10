import { YoutubeTranscript } from "youtube-transcript";
import axios from "axios";

interface VideoInfo {
    transcript: string;
    title: string;
    channelTitle: string;
    videoId: string;
}

export const fetchTranscript = async (url: string): Promise<VideoInfo> => {
    try {
        // Extract video ID from URL
        const videoId = url.split('v=')[1]?.split('&')[0];
        if (!videoId) {
            throw new Error('Invalid YouTube URL');
        }

        console.log('Attempting to fetch transcript for video ID:', videoId);

        // Fetch transcript first
        try {
            const transcript = await YoutubeTranscript.fetchTranscript(url);
            console.log('Transcript fetched successfully, length:', transcript.length);
            
            if (!transcript || transcript.length === 0) {
                throw new Error('This video does not have any captions/transcripts available. Please try a different video that has captions enabled.');
            }

            const transcriptText = transcript.map(entry => entry.text).join(' ');
            console.log('Transcript text length:', transcriptText.length);

            if (!transcriptText || transcriptText.trim().length === 0) {
                throw new Error('Transcript text is empty after processing');
            }

            // Try to get video details if YouTube API key is available
            let title = 'YouTube Video';
            let channelTitle = 'YouTube Channel';

            if (process.env.YOUTUBE_API_KEY) {
                try {
                    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`;
                    console.log('Fetching video details from:', apiUrl);
                    
                    const response = await axios.get(apiUrl);
                    
                    if (response.data.items && response.data.items.length > 0) {
                        const videoDetails = response.data.items[0].snippet;
                        title = videoDetails.title;
                        channelTitle = videoDetails.channelTitle;
                        console.log('Successfully fetched video details:', {
                            title,
                            channel: channelTitle
                        });
                    }
                } catch (apiError) {
                    console.warn('Could not fetch video details, using default values:', apiError);
                    // Continue with default values
                }
            } else {
                console.log('YouTube API key not found, using default values for title and channel');
            }

            return {
                transcript: transcriptText,
                title,
                channelTitle,
                videoId
            };
        } catch (transcriptError) {
            console.error('Error fetching transcript:', transcriptError);
            if (transcriptError instanceof Error && transcriptError.message.includes('Could not get the transcript')) {
                throw new Error('This video does not have any captions/transcripts available. Please try a different video that has captions enabled.');
            }
            throw new Error(`Failed to fetch transcript: ${transcriptError instanceof Error ? transcriptError.message : 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error in fetchTranscript:', error);
        throw error;
    }
}