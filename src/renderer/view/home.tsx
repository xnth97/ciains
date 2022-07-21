import { useState, useEffect } from 'react';
import {
  TextField,
  Stack,
  DefaultButton,
  PrimaryButton,
  DetailsList,
  SelectionMode,
  Dialog,
  DialogFooter,
  DialogType,
  Panel,
  CommandBar,
} from '@fluentui/react';
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

  useEffect(() => {
    window.api.getConsoleInfo()
    .then(info => {
      setConsoleAddress(info.address);
      setConsolePort(String(info.port));
    })
    .catch(err => console.error(err));
  }, []);

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

  return (
    <div>
      <div className='header'>
        <div style={{ marginLeft: -32, marginRight: -16 }}>
          <CommandBar
            items={[
              {
                key: 'loadRoms',
                text: 'Load ROMs',
                iconProps: { iconName: 'FolderOpen' },
                onClick: loadRoms,
              }, {
                key: 'clearRoms',
                text: 'Clear ROMs',
                iconProps: { iconName: 'Clear' },
                onClick: toggleHideDialog,
              }
            ]}
            farItems={[
              {
                key: 'settings',
                iconProps: { iconName: 'Settings' },
                onClick: openSettings,
              },
            ]}
          />
        </div>
        <div className='consoleInput'>
          <Stack
            horizontal
            horizontalAlign='space-between'
            >
            <Stack horizontal tokens={{
              childrenGap: 16,
            }}>
              <TextField 
                label='Console Address'
                value={consoleAddress} 
                onChange={e => setConsoleAddress(e.target.value)} />
              <TextField 
                label='Console Port' 
                value={consolePort} 
                onChange={e => setConsolePort(e.target.value)} />
            </Stack>
          </Stack>
        </div>
      </div>

      <div className='detailList'>
        <DetailsList
          columns={[
            { key: 'name', name: 'Name', fieldName: 'name', minWidth: 200, isResizable: true },
            { key: 'path', name: 'Path', fieldName: 'path', minWidth: 200, isResizable: true },
            { key: 'size', name: 'Size', fieldName: 'size', minWidth: 100, isResizable: true },
          ]}
          items={files}
          selectionMode={SelectionMode.none}
          />
      </div>
      
      <div className='footer'>
        <Stack horizontal style={{ margin: '8pt' }} tokens={{ childrenGap: 16 }}>
          <PrimaryButton style={{ width: '96pt' }} text='Install' onClick={async () => {
            const filePaths = files.map((obj) => obj.path);
            await window.api.install(consoleAddress, consolePort, filePaths);
          }} />
        </Stack>
        
      </div>

      <Dialog 
        hidden={hideDialog} 
        onDismiss={toggleHideDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Clear all ROMs?',
          subText: 'This cannot be undone.',
        }}
      >
        <DialogFooter>
          <DefaultButton onClick={toggleHideDialog} text='Cancel' />
          <PrimaryButton onClick={() => {
            toggleHideDialog();
            setFiles([]);
          }} text='Clear' />
        </DialogFooter>
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
