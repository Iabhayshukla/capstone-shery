export async function mockGenerateHTML(
  prompt: string,
  onChunk: (chunk: string) => void,
  onDone: (fullHtml: string) => void
): Promise<void> {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.html) {
      throw new Error('Invalid response from server');
    }

    const html = data.html;

    const chunkSize = 50;
    let accumulated = '';
    for (let i = 0; i < html.length; i += chunkSize) {
      await new Promise(res => setTimeout(res, 10));
      accumulated += html.slice(i, i + chunkSize);
      onChunk(accumulated);
    }

    onDone(html);

  } catch (error) {
    console.error('Generate failed:', error);
    throw error;
  }
}