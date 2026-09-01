import { SaveLibraryTypeEnum } from "@utils/main/save.type";

export const LIBS_FUNCTIONS_NAME: Record<SaveLibraryTypeEnum | string, string> = {
  [SaveLibraryTypeEnum.ASSET_MANAGER]: "useAssetManager",
  [SaveLibraryTypeEnum.COMPONENT_SYSTEM]: "useComponentSystem",
  [SaveLibraryTypeEnum.GRAPHICS]: "useGraphics",
  [SaveLibraryTypeEnum.INPUT]: "useInput",
  [SaveLibraryTypeEnum.NETWORK]: "useNetwork",
  [SaveLibraryTypeEnum.SOUND]: "useSound",
};
