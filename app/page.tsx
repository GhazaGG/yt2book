'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import VideoPreview from '@/components/VideoPreview';
import { saveAs } from 'file-saver';

const GENERATE_BOOK = gql`
  mutation GenerateBook($youtubeUrl: String!) {
    generateBook(youtubeUrl: $youtubeUrl) {
      id
      content
      pdf
      title
      videoId
    }
  }
`;

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [generateBook] = useMutation(GENERATE_BOOK);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setBook(null);

    try {
      console.log('Starting book generation for URL:', youtubeUrl);
      const { data } = await generateBook({
        variables: { youtubeUrl },
      });
      console.log('Book generation response:', data);
      
      if (!data?.generateBook) {
        throw new Error('No book data received from server');
      }
      
      setBook(data.generateBook);
    } catch (err) {
      console.error('Book generation error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (err && typeof err === 'object' && 'graphQLErrors' in err) {
        // Handle GraphQL errors
        const graphQLErrors = (err as any).graphQLErrors;
        if (Array.isArray(graphQLErrors) && graphQLErrors.length > 0) {
          setError(graphQLErrors[0].message);
        } else {
          setError('An error occurred while generating the book');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!book?.pdf) return;
    
    try {
      // Remove the data:application/pdf;base64, prefix
      const base64Data = book.pdf.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // Use the book title as the filename, or default to 'youtube-book.pdf'
      const filename = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      saveAs(blob, filename);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download PDF. Please try again.');
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">YouTube to Book</h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Enter YouTube URL"
              className="flex-1 p-2 border rounded"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? 'Generating...' : 'Generate Book'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-8 p-4 bg-red-100 text-red-700 rounded">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {book && (
          <div className="space-y-8">
            <VideoPreview videoId={book.videoId} title={book.title} />
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">{book.title}</h2>
              <div className="prose max-w-none">
                {book.content.split('\n').map((paragraph: string, index: number) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {book.pdf && (
              <div className="text-center">
                <button
                  onClick={handleDownload}
                  className="inline-block px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Download PDF
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
