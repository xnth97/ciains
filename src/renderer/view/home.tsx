import { useState, useEffect } from 'react';
import {
  Button,
} from '@fluentui/react-components';
import { 
  Dialog,
  DialogSurface,
  // DialogContent,
  DialogTitle, 
  DialogBody, 
  DialogActions, 
  InputField,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  Table,
  TableRow,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableCellLayout,
  TableCellActions,
} from '@fluentui/react-components/unstable';
import {
  FolderOpenRegular,
  SettingsRegular,
  DismissRegular,
  DeleteRegular,
} from '@fluentui/react-icons';
import { useBoolean } from '@fluentui/react-hooks';
import IFileInfo from '../../main/model/IFileInfo';
import Settings from './settings';

const Home = () => {
  const [consoleAddress, setConsoleAddress] = useState('');
  const [consolePort, setConsolePort] = useState('5000');
  const [files, setFiles] = useState<Array<IFileInfo>>([]);
  const [showDialog, { toggle: toggleShowDialog }] = useBoolean(false);
  const [settingsIsOpen, { setTrue: openSettings, setFalse: dismissSettings }] = useBoolean(false);

  const loadRoms = async () => {
    const newFiles: IFileInfo[] = await window.api.loadFiles();
    const filesArr = [...files];
    const pathSet = new Set();
    files.forEach(file => {
      pathSet.add(file.path);
    });
    for (const file of newFiles) {
      if (pathSet.has(file.path)) {
        continue;
      }
      filesArr.push(file);
    }
    setFiles(filesArr);
  }

  useEffect(() => {
    window.api.getConsoleInfo()
    .then(info => {
      setConsoleAddress(info.address);
      setConsolePort(String(info.port));
    })
    .catch(err => console.error(err));

    window.api.handleOpenFiles((_event) => {
      loadRoms();
    });
    window.api.handleOpenSettings((_e) => {
      openSettings();
    });
  }, []);

  const columns = [
    { key: 'name', name: 'Name', fieldName: 'name', minWidth: 200, isResizable: true },
    // { key: 'path', name: 'Path', fieldName: 'path', minWidth: 200, isResizable: true },
    { key: 'size', name: 'Size', fieldName: 'size', minWidth: 100, isResizable: true },
  ];

  return (
    <div>
      <div className='fixed top-0 left-0'>
        <div>
          <Toolbar>
            <ToolbarButton icon={<FolderOpenRegular />} onClick={loadRoms}>
              Open ROMs
            </ToolbarButton>
            <ToolbarButton icon={<DismissRegular />} onClick={toggleShowDialog}>
              Clear ROMs
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton icon={<SettingsRegular />} onClick={openSettings}>
              Settings
            </ToolbarButton>
          </Toolbar>
        </div>
        <div className='flex flex-row space-x-4 mx-4'>
          <InputField
            label='Console Address'
            value={consoleAddress}
            onChange={e => setConsoleAddress(e.target.value)} />
          <InputField
            label='Console Port'
            value={consolePort}
            onChange={e => setConsolePort(e.target.value)} />
        </div>
      </div>

      <div className='absolute top-24 w-screen px-4 pb-16 -z-50'>
        <Table>
          <TableHeader>
            <TableRow>
              { columns.map(col => (
                <TableHeaderCell key={col.key}>{col.name}</TableHeaderCell>
              )) }
            </TableRow>
          </TableHeader>
          <TableBody>
            { files.map(file => (
              <TableRow key={file.path}>
                <TableCell>
                  <TableCellLayout>{file.name}</TableCellLayout>
                </TableCell>
                <TableCell>
                  <TableCellLayout>{file.size}</TableCellLayout>
                  <TableCellActions>
                    <Button icon={<DeleteRegular/>} appearance='subtle' onClick={() => {
                      const rmFiles = files.filter((e) => e.path !== file.path);
                      setFiles(rmFiles);
                    }} />
                  </TableCellActions>
                </TableCell>
              </TableRow>
            )) }
          </TableBody>
        </Table>
      </div>
      
      <div className='absolute bottom-4 left-4 z-50'>
        <Button appearance='primary' style={{ width: '96pt' }} onClick={async () => {
          const filePaths = files.map((obj) => obj.path);
          await window.api.install(consoleAddress, consolePort, filePaths);
        }}>
          Install
        </Button>
      </div>

      <Dialog 
        open={showDialog} 
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Clear all ROMs?</DialogTitle>
            {/* <DialogContent>This cannot be undone</DialogContent> */}
            <DialogActions>
              <Button onClick={toggleShowDialog}>Cancel</Button>
              <Button appearance='primary' onClick={() => {
                toggleShowDialog();
                setFiles([]);
              }}>Clear</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog
        open={settingsIsOpen}
      >
        <DialogSurface>
          <DialogTitle>Settings</DialogTitle>
          <Settings onClose={dismissSettings} />
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default Home;
