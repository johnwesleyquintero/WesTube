
import React, { useState } from 'react';
import { GeneratedPackage } from '../../../types';
import { CopyButton } from '../../../components/CopyButton';

interface AssetsTabProps {
  result: GeneratedPackage;
  handleGenerateThumbnail: (prompt: string, idx: number) => void;
  handleEditThumbnail?: (base64: string, prompt: string, idx: number) => void;
  generatingImage: number | null;
  editingImage?: number | null;
}

export const AssetsTab: React.FC<AssetsTabProps> = ({ 
  result, 
  handleGenerateThumbnail, 
  handleEditThumbnail,
  generatingImage,
  editingImage 
}) => {
  const [activeEditIndex, setActiveEditIndex] = useState<number | null>(null);
  const [editPrompt, setEditPrompt] = useState('');

  const submitEdit = (index: number, base64: string) => {
    if (handleEditThumbnail && editPrompt.trim()) {
      handleEditThumbnail(base64, editPrompt, index);
      setActiveEditIndex(null);
      setEditPrompt('');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Thumbnail Section */}
      <div>
        <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center">
          <span className="w-8 h-8 rounded-lg bg-wes-pop/10 flex items-center justify-center mr-3 border border-wes-pop/20 text-wes-pop">
            <i className="fa-solid fa-image"></i>
          </span>
          Thumbnail Lab
        </h3>
        <div className="grid grid-cols-1 gap-6">
          {result.thumbnailPrompts.map((prompt, i) => (
            <div key={i} className="glass-panel rounded-xl overflow-hidden flex flex-col md:flex-row shadow-lg">
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-wes-pop uppercase tracking-widest bg-wes-pop/10 px-2 py-1 rounded">Variant {i+1}</span>
                      <CopyButton text={prompt} />
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed mb-6 font-light">{prompt}</p>
                  </div>
                  <button 
                    onClick={() => handleGenerateThumbnail(prompt, i)}
                    disabled={generatingImage === i || editingImage === i}
                    className="self-start px-5 py-2.5 bg-wes-pop/10 hover:bg-wes-pop/20 text-wes-pop border border-wes-pop/20 hover:border-wes-pop/40 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                  >
                    {generatingImage === i ? (
                      <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                    ) : (
                      <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                    )}
                    {result.generatedImages?.[i] ? 'Regenerate Base' : 'Render Asset'}
                  </button>
                </div>
                
                <div className="w-full md:w-72 bg-wes-950/50 min-h-[180px] flex items-center justify-center border-t md:border-t-0 md:border-l border-wes-700 relative group">
                  {result.generatedImages?.[i] ? (
                    <>
                      <img 
                        src={result.generatedImages[i]} 
                        alt={`Thumbnail ${i+1}`} 
                        className={`w-full h-full object-cover transition-opacity ${editingImage === i ? 'opacity-50 blur-sm' : ''}`}
                      />
                      
                      {/* Editing Overlay */}
                      {editingImage === i && (
                         <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="bg-black/80 px-4 py-2 rounded-lg flex items-center gap-2 border border-wes-pop/50">
                               <i className="fa-solid fa-circle-notch fa-spin text-wes-pop"></i>
                               <span className="text-xs font-bold text-white">Refining...</span>
                            </div>
                         </div>
                      )}

                      {/* Controls Overlay */}
                      {!activeEditIndex && activeEditIndex !== i && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                          <a 
                            href={result.generatedImages[i]} 
                            download={`wes-thumbnail-${i}.png`}
                            className="px-3 py-1.5 bg-white text-black rounded text-[10px] font-bold hover:scale-105 transition-transform flex items-center"
                            title="Download Image"
                          >
                            <i className="fa-solid fa-download mr-1"></i> Save
                          </a>
                          {handleEditThumbnail && (
                             <button
                               onClick={() => setActiveEditIndex(i)}
                               className="px-3 py-1.5 bg-wes-pop text-white rounded text-[10px] font-bold hover:scale-105 transition-transform flex items-center shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                             >
                                <i className="fa-solid fa-wand-magic mr-1"></i> Refine
                             </button>
                          )}
                        </div>
                      )}

                      {/* Edit Input Mode */}
                      {activeEditIndex === i && !editingImage && (
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col p-4 animate-fadeIn">
                           <label className="text-[10px] font-bold text-wes-pop uppercase mb-2">Refinement Instruction</label>
                           <textarea
                             autoFocus
                             value={editPrompt}
                             onChange={(e) => setEditPrompt(e.target.value)}
                             placeholder="e.g., Make it darker, add neon..."
                             className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white resize-none mb-2 focus:border-wes-pop outline-none"
                           />
                           <div className="flex gap-2">
                              <button 
                                onClick={() => setActiveEditIndex(null)}
                                className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-xs rounded text-slate-300"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => submitEdit(i, result.generatedImages![i])}
                                className="flex-1 py-1.5 bg-wes-pop hover:bg-wes-pop/80 text-xs rounded text-white font-bold"
                              >
                                Apply
                              </button>
                           </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-slate-500 flex flex-col items-center">
                      <i className="fa-regular fa-image text-3xl mb-2 opacity-50"></i>
                      <span className="text-[10px] uppercase tracking-widest">Preview Area</span>
                    </div>
                  )}
                </div>
            </div>
          ))}
        </div>
      </div>

      {/* Music Section */}
      <div>
        <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center">
          <span className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center mr-3 border border-pink-500/20 text-pink-500">
            <i className="fa-solid fa-headphones"></i>
          </span>
          Sonic Architecture
        </h3>
        <div className="glass-panel p-6 rounded-xl border border-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.05)]">
            <div className="flex justify-between items-center mb-3">
               <h4 className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Prompt Engineering (Suno/Udio)</h4>
               <CopyButton text={result.musicPrompt} />
            </div>
            <p className="text-sm text-slate-300 font-mono bg-wes-800 p-4 rounded-lg border border-pink-500/20 mb-6">{result.musicPrompt}</p>
            
            <h4 className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-2">Visual Aesthetic Guideline</h4>
            <p className="text-sm text-slate-300 font-light">{result.imageGenPrompt}</p>
        </div>
      </div>
    </div>
  );
};