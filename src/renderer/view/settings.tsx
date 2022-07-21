import { useState, useEffect } from "react";
import {
  Stack,
  TextField,
  PrimaryButton,
  DefaultButton,
  ActionButton,
} from '@fluentui/react';

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
      <Stack tokens={{
        childrenGap: 16,
      }}>
        <TextField label='Host Address' value={hostAddress} onChange={(e) => setHostAddress(e.target.value)} />
        <TextField label='Host Port' value={hostPort} onChange={(e) => setHostPort(e.target.value)} />
        <ActionButton text='Detect Address' iconProps={{ iconName: 'WifiEthernet' }} onClick={detectAddress} />
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <PrimaryButton onClick={save}>Save</PrimaryButton>
          <DefaultButton onClick={props.onClose}>Cancel</DefaultButton>
        </Stack>
      </Stack>
    </div>
  );
};

export default Settings;