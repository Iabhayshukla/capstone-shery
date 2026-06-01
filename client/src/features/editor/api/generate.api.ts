export async function generateHTML(
  prompt: string,
  onChunk: (chunk: string) => void,
  onDone: (fullHtml: string) => void
): Promise<void> {
  const response = await fetch('http://127.0.0.1:8000/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  const data = await response.json();
  const html = data.html;

  // Chunked feel ke liye — real SSE baad mein
  const chunkSize = 50;
  let accumulated = '';
  for (let i = 0; i < html.length; i += chunkSize) {
    await new Promise(res => setTimeout(res, 10));
    accumulated += html.slice(i, i + chunkSize);
    onChunk(accumulated);
  }

  onDone(html);
}

// Backward compatibility — mock ko replace kiya
export const mockGenerateHTML = generateHTML;