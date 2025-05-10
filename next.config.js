/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    },
}

module.exports = nextConfig 