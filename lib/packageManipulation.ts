import { GeneratedPackage } from "../types";

/**
 * Immutably updates the generatedImages map within a package.
 */
export const updatePackageThumbnail = (
  pkg: GeneratedPackage, 
  index: number, 
  imageBase64: string
): GeneratedPackage => {
  return {
    ...pkg,
    generatedImages: {
      ...(pkg.generatedImages || {}),
      [index]: imageBase64
    }
  };
};

/**
 * Immutably updates a specific scene's visual asset within the script array.
 */
export const updatePackageSceneVisual = (
  pkg: GeneratedPackage, 
  index: number, 
  imageBase64: string
): GeneratedPackage => {
  const updatedScript = [...pkg.script];
  updatedScript[index] = {
    ...updatedScript[index],
    generatedVisual: imageBase64
  };

  return {
    ...pkg,
    script: updatedScript
  };
};

/**
 * Immutably updates a specific scene's audio asset within the script array.
 * Pass undefined as audioBase64 to clear the cache (e.g. when text changes).
 */
export const updatePackageSceneAudio = (
  pkg: GeneratedPackage, 
  index: number, 
  audioBase64: string | undefined
): GeneratedPackage => {
  const updatedScript = [...pkg.script];
  updatedScript[index] = {
    ...updatedScript[index],
    generatedAudio: audioBase64
  };

  return {
    ...pkg,
    script: updatedScript
  };
};