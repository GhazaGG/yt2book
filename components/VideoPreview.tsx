import React from 'react';

interface VideoPreviewProps {
    videoId: string;
    title: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoId, title }) => {
    return (
        <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-lg">
                <img
                    src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback to standard quality if maxresdefault is not available
                        const target = e.target as HTMLImageElement;
                        target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                    }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white text-lg font-semibold line-clamp-2">
                        {title}
                    </h3>
                </div>
            </div>
        </div>
    );
};

export default VideoPreview; 