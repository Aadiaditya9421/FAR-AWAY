import Editor from '@monaco-editor/react';

export default function CodeEditor({ value, language, onChange }) {
  return (
    <div className="border border-borderColor rounded-xl overflow-hidden bg-[#111827] min-h-[360px]">
      <Editor
        height="360px"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(nextValue) => onChange(nextValue || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: 'JetBrains Mono, monospace',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 2,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
