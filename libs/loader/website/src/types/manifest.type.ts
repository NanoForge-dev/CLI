export interface IManifestFile {
  path: string;
}

export interface IManifest {
  version: string;
  files: IManifestFile[];
  watch: { enable: false } | { enable: true; url: string };
}

export interface IExtendedManifestFile extends IManifestFile {
  localPath: string;
}

export interface IExtendedManifest {
  files: IExtendedManifestFile[];
}
