"use client";
import { useState } from 'react';
import { saveAs } from 'file-saver';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedPdf(null);
    setError(null);

    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Sending request to:', `${process.env.NEXT_PUBLIC_BASE_URL}/api/graphql`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/graphql`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: `
          mutation GenerateBook($url: String!) {
            generateBook(youtubeUrl: $url) {
              pdf
            }
          }
          `,
          variables: { url },
        }),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error('Invalid response from server');
      }
      
      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        throw new Error(data.errors[0].message);
      }
      
      if (!data?.data?.generateBook) {
        console.error('No data in response:', data);
        throw new Error('Failed to generate book');
      }

      setGeneratedPdf(data.data.generateBook.pdf);
    } catch (error) {
      console.error('Generation error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
        
  const handleDownload = () => {
    if (!generatedPdf) return;
    
    try {
      const byteCharacters = atob(generatedPdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      saveAs(blob, 'youtube-book.pdf');
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          YouTube to Book Converter
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter YouTube URL"
              className="w-full px-4 py-2 border text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 text-white font-medium rounded-lg ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Processing...' : 'Generate Book'}
          </button>
        </form>

        {generatedPdf && (
          <div className="mt-4">
            <button
              onClick={handleDownload}
              className="w-full py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
            >
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}