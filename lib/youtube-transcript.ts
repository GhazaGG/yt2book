import { YoutubeTranscript } from "youtube-transcript";
import axios from "axios";

interface VideoInfo {
    transcript: string;
    title: string;
    channelTitle: string;
}

export const fetchTranscript = async (url: string): Promise<VideoInfo> => {
    // Debug environment variables
    console.log('Environment variables in youtube-transcript.ts:');
    console.log('YOUTUBE_API_KEY length:', process.env.YOUTUBE_API_KEY?.length || 0);
    console.log('YOUTUBE_API_KEY first 4 chars:', process.env.YOUTUBE_API_KEY?.substring(0, 4) || 'none');
    
    // Extract video ID from URL
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (!videoId) {
        throw new Error('Invalid YouTube URL');
    }

    // Fetch transcript
    const transcript = await YoutubeTranscript.fetchTranscript(url);
    const transcriptText = transcript.map(entry => entry.text).join(' ');

    // Fetch video details using YouTube Data API
    try {
        // Debug logging
        console.log('Using YouTube API Key:', process.env.YOUTUBE_API_KEY ? 'API Key exists' : 'API Key missing');
        
        if (!process.env.YOUTUBE_API_KEY) {
            throw new Error('YouTube API Key is not defined in environment variables');
        }

        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`;
        console.log('Fetching video details from:', apiUrl);
        
        const response = await axios.get(apiUrl);
        
        if (!response.data.items || response.data.items.length === 0) {
            throw new Error('Could not fetch video details');
        }

        const videoDetails = response.data.items[0].snippet;
        console.log('Successfully fetched video details:', {
            title: videoDetails.title,
            channel: videoDetails.channelTitle
        });

        return {
            transcript: transcriptText,
            title: videoDetails.title,
            channelTitle: videoDetails.channelTitle
        };
    } catch (error) {
        console.error('Error fetching video details:', error);
        // If we can't get the video details, return just the transcript
        return {
            transcript: transcriptText,
            title: 'YouTube Video',
            channelTitle: 'Unknown Channel'
        };
    }
}