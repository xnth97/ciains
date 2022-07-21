import IFileInfo from "./IFileInfo"
import IHostInfo from "./IHostInfo"

declare global {
  interface Window {
    api: {
      loadFiles: () => Promise<IFileInfo[]>,
      install: (addr: string, port: string, files: string[]) => Promise<boolean>,
      getHostInfo: () => Promise<IHostInfo>,
      setHostInfo: (addr: string, port: string) => Promise<void>,
      getConsoleInfo: () => Promise<IHostInfo>,
      detectAddress: () => Promise<string>,
    }
  }
}