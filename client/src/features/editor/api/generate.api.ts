export async function mockGenerateHTML(
  prompt: string,
  onChunk: (chunk: string) => void,
  onDone: (fullHtml: string) => void,
  options?: {
    currentHtml?: string;
    selectedSection?: string | null;
  }
): Promise<void> {
  try {
    // Build context-aware prompt
    let finalPrompt = prompt;

    if (options?.selectedSection && options?.currentHtml) {
      finalPrompt = `
You are editing an existing website. Here is the current HTML:

\`\`\`html
${options.currentHtml}
\`\`\`

The user wants to edit ONLY the "${options.selectedSection}" section.
Do NOT change any other part of the page.
User instruction: ${prompt}

Return the complete updated HTML with only the "${options.selectedSection}" section modified.
      `.trim();
    } else if (options?.currentHtml) {
      finalPrompt = `
You are editing an existing website. Here is the current HTML:

\`\`\`html
${options.currentHtml}
\`\`\`

User instruction: ${prompt}

Return the complete updated HTML.
      `.trim();
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: finalPrompt }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.html) {
      throw new Error('Invalid response from server');
    }

    const html = data.html;

    // Fake streaming — chunk by chunk
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