import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { GeneratedPackage, ChannelId } from '../types';
import { CHANNELS } from '../constants';

/**
 * Converts a Base64 data string to a Blob.
 */
const base64ToBlob = async (base64: string): Promise<Blob> => {
  const res = await fetch(base64);
  return await res.blob();
};

/**
 * Generates a formatted Markdown string for the script.
 */
const generateScriptMarkdown = (pkg: GeneratedPackage): string => {
  const channelName = pkg.channelId ? CHANNELS[pkg.channelId].name : 'Unknown Channel';
  
  let md = `# ${pkg.title}\n`;
  md += `**Channel:** ${channelName}\n`;
  md += `**Hook:** ${pkg.hook}\n`;
  md += `**Branding Note:** ${pkg.brandingNote}\n\n`;
  md += `--- \n\n`;

  pkg.script.forEach((scene, index) => {
    md += `## Scene ${index + 1} (${scene.timestamp})\n\n`;
    md += `**Visual:**\n> ${scene.visual}\n\n`;
    md += `**Audio:**\n${scene.audio}\n\n`;
    md += `--- \n\n`;
  });

  return md;
};

/**
 * Generates a text file for SEO Metadata.
 */
const generateMetadataText = (pkg: GeneratedPackage): string => {
  let txt = `TITLE:\n${pkg.title}\n\n`;
  txt += `DESCRIPTION:\n${pkg.description}\n\n`;
  txt += `TAGS:\n${pkg.tags.join(', ')}\n\n`;
  
  if (pkg.researchSummary) {
    txt += `RESEARCH SUMMARY:\n${pkg.researchSummary}\n\n`;
  }
  
  if (pkg.sources && pkg.sources.length > 0) {
    txt += `SOURCES:\n${pkg.sources.join('\n')}\n\n`;
  }

  txt += `THUMBNAIL PROMPTS:\n`;
  pkg.thumbnailPrompts.forEach((p, i) => {
    txt += `${i + 1}. ${p}\n`;
  });

  txt += `\nMUSIC PROMPT:\n${pkg.musicPrompt}\n`;

  return txt;
};

/**
 * The Main Export Function
 * Compiles Script, Metadata, Assets, and JSON into a ZIP file.
 */
export const exportProductionKit = async (pkg: GeneratedPackage, onProgress: (msg: string) => void) => {
  try {
    onProgress("Initializing Production Compiler...");
    const zip = new JSZip();
    
    // 1. Create Folder Structure
    const rootName = `${pkg.channelId || 'wes'}_production_${new Date().toISOString().split('T')[0]}`;
    const root = zip.folder(rootName);
    
    if (!root) throw new Error("Failed to create zip folder");

    const assetsFolder = root.folder("assets");

    // 2. Add Documents
    onProgress("Formatting Script & Metadata...");
    root.file("script.md", generateScriptMarkdown(pkg));
    root.file("metadata.txt", generateMetadataText(pkg));
    root.file("project_data.json", JSON.stringify(pkg, null, 2));

    // 3. Process Images
    onProgress("Compressing Visual Assets...");
    
    // Process Thumbnails
    if (pkg.generatedImages) {
      for (const [index, base64] of Object.entries(pkg.generatedImages)) {
        if (base64) {
          const blob = await base64ToBlob(base64 as string);
          assetsFolder?.file(`thumbnail_variant_${parseInt(index) + 1}.png`, blob);
        }
      }
    }

    // Process Scene Visuals
    let visualCount = 0;
    for (let i = 0; i < pkg.script.length; i++) {
      const scene = pkg.script[i];
      if (scene.generatedVisual) {
        const blob = await base64ToBlob(scene.generatedVisual);
        assetsFolder?.file(`scene_${i + 1}_visual.png`, blob);
        visualCount++;
      }
    }

    // 4. Generate Zip
    onProgress("Finalizing Package...");
    const content = await zip.generateAsync({ type: "blob" });
    
    // 5. Save
    onProgress("Download Starting...");
    saveAs(content, `${rootName}.zip`);

    return true;
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
};