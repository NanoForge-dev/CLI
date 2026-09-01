export class FileSystemFile {
  readonly handle: FileSystemFileHandle;

  constructor(handle: FileSystemFileHandle) {
    this.handle = handle;
  }

  getFile(): Promise<File> {
    return this.handle.getFile();
  }

  getWritable(keep = false): Promise<FileSystemWritableFileStream> {
    return this.handle.createWritable({
      keepExistingData: keep,
    });
  }

  async getUrl(): Promise<string> {
    const file = await this.handle.getFile();
    return URL.createObjectURL(file);
  }

  isSame(file: FileSystemFile): Promise<boolean> {
    return this.handle.isSameEntry(file.handle);
  }
}
