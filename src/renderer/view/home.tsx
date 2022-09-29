import { useState, useEffect } from 'react';
import {
  // TextField,
  Stack,
  // DefaultButton,
  // PrimaryButton,
  // DetailsList,
  SelectionMode,
  // Dialog,
  // DialogFooter,
  // DialogType,
  Panel,
  // CommandBar,
  // Link,
} from '@fluentui/react';
import {
  Button,
  Link,
} from '@fluentui/react-components';
import { 
  Dialog,
  DialogSurface, 
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
import './home.scss';
import IFileInfo from '../../main/model/IFileInfo';
import Settings from './settings';

const Home = () => {
  const [consoleAddress, setConsoleAddress] = useState('');
  const [consolePort, setConsolePort] = useState('5000');
  const [files, setFiles] = useState<Array<IFileInfo>>([]);
  const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
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
      <div className='header'>
        <div style={{ marginLeft: -16, marginRight: -16 }}>
          <Toolbar>
            <ToolbarButton icon={<FolderOpenRegular />} onClick={loadRoms}>
              Open ROMs
            </ToolbarButton>
            <ToolbarButton icon={<DismissRegular />} onClick={toggleHideDialog}>
              Clear ROMs
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton icon={<SettingsRegular />} onClick={openSettings}>
              Settings
            </ToolbarButton>
          </Toolbar>
        </div>
        <div>
          <Stack
            horizontal
            horizontalAlign='space-between'
            >
            <Stack horizontal tokens={{
              childrenGap: 16,
            }}>
              <InputField
                label='Console Address'
                value={consoleAddress} 
                onChange={e => setConsoleAddress(e.target.value)} />
              <InputField 
                label='Console Port' 
                value={consolePort} 
                onChange={e => setConsolePort(e.target.value)} />
            </Stack>
          </Stack>
        </div>
      </div>

      <div className='detailList'>
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
                  <TableCellActions>
                    <Button icon={<DeleteRegular/>} appearance='subtle' onClick={() => {
                      const rmFiles = files.filter((e) => e.path !== file.path);
                      setFiles(rmFiles);
                    }} />
                  </TableCellActions>
                </TableCell>
                <TableCell>
                  <TableCellLayout>{file.size}</TableCellLayout>
                </TableCell>
              </TableRow>
            )) }
          </TableBody>
        </Table>
      </div>
      
      <div className='footer'>
        <Stack horizontal style={{ margin: '8pt' }} tokens={{ childrenGap: 16 }}>
          <Button appearance='primary' style={{ width: '96pt' }} onClick={async () => {
            const filePaths = files.map((obj) => obj.path);
            await window.api.install(consoleAddress, consolePort, filePaths);
          }}>
            Install
          </Button>
        </Stack>
        
      </div>

      <Dialog 
        open={!hideDialog} 
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Clear all ROMs?</DialogTitle>
            {/* <DialogContent>This cannot be undone</DialogContent> */}
            <DialogActions>
              <Button onClick={toggleHideDialog}>Cancel</Button>
              <Button appearance='primary' onClick={() => {
                toggleHideDialog();
                setFiles([]);
              }}>Clear</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Panel 
        headerText='Settings'
        isOpen={settingsIsOpen}
        onDismiss={dismissSettings}
        closeButtonAriaLabel='Close'
      >
        <Settings onClose={dismissSettings} />
      </Panel>
    </div>
  );
};

export default Home;
