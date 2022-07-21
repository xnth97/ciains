/* eslint-disable class-methods-use-this */
import { dialog } from 'electron';
import fs from 'fs';
import path from 'path';
import ip from 'ip';
import http from 'http';
import { Socket } from 'net';
import express, { Express } from 'express';
import Store from 'electron-store';
import IFileInfo from 'main/model/IFileInfo';
import IHostInfo from './IHostInfo';

class AppModel {

  private static readonly addressKey = 'host_address';
  private static readonly portKey = 'host_port';
  private static readonly consoleAddressKey = 'console_address';
  private static readonly consolePortKey = 'console_port';

  private static _instance: AppModel;

  private readonly app: Express;
  private readonly store: Store;
  private server: http.Server;
  private address: string;
  private port: number;
  private fileNamePathMap: Map<string, string>;

  private constructor() {
    this.fileNamePathMap = new Map<string, string>();
    this.store = new Store();
    this.address = (this.store.get(AppModel.addressKey) as string) ?? ip.address();
    this.port = (this.store.get(AppModel.portKey) as number) ?? 8688;
    this.app = express();

    this.app.get('/:fileName', (req, res) => {
      const fileName = decodeURI(req.params.fileName);
      const filePath = this.fileNamePathMap.get(fileName);

      if (filePath === undefined || !fs.existsSync(filePath)) {
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end();
        return;
      }

      res.sendFile(filePath);
    });

    this.server = this.app.listen(this.port);
  }

  public static get shared() {
    if (this._instance === undefined) {
      this._instance = new this();
    }
    return this._instance;
  }

  async loadFiles(): Promise<IFileInfo[]> {
    return dialog.showOpenDialog({
      title: 'Open ROMs',
      filters: [
        { name: 'ROMs', extensions: ['cia', 'tik', 'cetk', '3dsx'] }
      ],
      properties: ['multiSelections', 'openFile'],
    })
    .then((res) => {
      if (res.canceled) {
        return [];
      }
      const dataArr: IFileInfo[] = [];
      for (const filePath of res.filePaths) {
        const filename = path.basename(filePath);
        const fileSize = AppModel.getFileSize(filePath);
        dataArr.push({
          name: filename,
          path: filePath,
          size: fileSize,
        });
      }
      return dataArr;
    });
  }

  async install(address: string, port: string, files: string[]): Promise<boolean> {
    // save console info
    this.store.set(AppModel.consoleAddressKey, address);
    this.store.set(AppModel.consolePortKey, Number(port));

    const hostIp = this.address;
    const hostPort = this.port;

    const urls: string[] = [];
    for (const filePath of files) {
      const fileName = path.basename(filePath);
      const encodedFileName = encodeURI(fileName);
      const fileUrl = `http://${hostIp}:${hostPort}/${encodedFileName}`;
      urls.push(fileUrl);
      this.fileNamePathMap.set(fileName, filePath);
    }

    const urlsData = Buffer.from(urls.join('\n'), 'utf-8');
    const urlsLengthBuf = Buffer.alloc(4);
    urlsLengthBuf.writeUInt32BE(urlsData.length);
    
    const buf = Buffer.concat([urlsLengthBuf, urlsData]);
    const socket = new Socket();
    if (address.length === 0 || port.length === 0) {
      this.showConnectError();
      return false;
    }

    try {
      socket.connect(Number(port), address, () => {
        socket.write(buf);
        socket.end();
      });
    } catch (err) {
      this.showConnectError();
      return false;
    }

    return true;
  }

  setHostInfo(address: string, port: string) {
    this.address = address;
    this.port = Number(port);

    this.store.set(AppModel.addressKey, this.address);
    this.store.set(AppModel.portKey, this.port);

    this.server.close();
    this.server = this.app.listen(this.port);
  }

  get hostInfo(): IHostInfo {
    return {
      address: this.address,
      port: this.port,
    };
  }

  get consoleInfo(): IHostInfo {
    const consoleAddr = this.store.get(AppModel.consoleAddressKey) as string ?? '';
    const consolePort = this.store.get(AppModel.consolePortKey) as string ?? '5000'
    return {
      address: consoleAddr,
      port: Number(consolePort),
    };
  }

  get detectedAddress(): string {
    return ip.address();
  }

  private static getFileSize(filePath: string): string {
    const { size } = fs.statSync(filePath);
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return `${(size / (1024 ** i)).toFixed(2)} ${['B', 'kB', 'MB', 'GB', 'TB'][i]}`;
  }

  private showConnectError() {
    dialog.showMessageBox({
      title: 'Error',
      message: 'Cannot connect to console',
      detail: 'Please make sure that console address and port are correct.',
    });
  }

}

export default AppModel;