import { useState, useEffect } from 'react';
import {
  Stack,
} from '@fluentui/react';
import {
  Button,
  FluentProvider,
  webLightTheme,
} from '@fluentui/react-components';
import {
  InputField
} from '@fluentui/react-components/unstable';
import {
  Wifi124Regular,
} from '@fluentui/react-icons';

interface ISettingsProps {
  onClose: () => void;
}

const Settings = (props: ISettingsProps) => {
  const [hostAddress, setHostAddress] = useState('');
  const [hostPort, setHostPort] = useState('');

  useEffect(() => {
    window.api.getHostInfo()
      .then((hostInfo) => {
        setHostAddress(hostInfo.address);
        setHostPort(String(hostInfo.port));
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  const save = () => {
    window.api.setHostInfo(hostAddress, hostPort)
      .then(() => {
        props.onClose();
      })
      .catch(err => {
        console.error(err);
      });
  };

  const detectAddress = () => {
    window.api.detectAddress()
      .then(addr => setHostAddress(addr))
      .catch(err => console.error(err));
  };

  return (
    <div>
      <FluentProvider theme={webLightTheme}>
        <Stack tokens={{
          childrenGap: 16,
        }}>
          <InputField label='Host Address' value={hostAddress} onChange={(e) => setHostAddress(e.target.value)} />
          <InputField label='Host Port' value={hostPort} onChange={(e) => setHostPort(e.target.value)} />
          <Button appearance='subtle' icon={<Wifi124Regular />} onClick={detectAddress}>
            Detect Address
          </Button>
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <Button appearance='primary' onClick={save}>Save</Button>
            <Button onClick={props.onClose}>Cancel</Button>
          </Stack>
        </Stack>
      </FluentProvider>
    </div>
  );
};

export default Settings;