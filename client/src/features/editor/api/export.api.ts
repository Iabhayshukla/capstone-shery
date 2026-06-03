export async function exportProject(projectId: string): Promise<void> {
  try {
    const response = await fetch(`http://127.0.0.1:8000/export/${projectId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${projectId}.zip`;
    a.click();
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

// Agar sirf HTML download karna ho
export function exportHtml(html: string, filename = 'website.html'): void {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}