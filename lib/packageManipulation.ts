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