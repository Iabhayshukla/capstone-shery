import { loader } from '@monaco-editor/react';

loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs',
  },
});

export async function initMonaco() {
  const monaco = await loader.init();
  return monaco;
}

export default loader;