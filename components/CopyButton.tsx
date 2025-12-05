import React, { useState } from 'react';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, className = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`text-slate-500 hover:text-wes-accent transition-all flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded hover:bg-white/5 ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <i className="fa-solid fa-check text-wes-success"></i>
          <span className="text-wes-success">Copied</span>
        </>
      ) : (
        <>
          <i className="fa-regular fa-copy"></i>
          <span>Copy</span>
        </>
      )}
    </button>
  );
};