import { useState, useEffect } from 'react';
import {
  Button,
} from '@fluentui/react-components';
import {
  InputField,
  DialogActions,
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
    <div className='flex flex-col space-y-4'>
      <InputField label='Host Address' value={hostAddress} onChange={(e) => setHostAddress(e.target.value)} />
      <InputField label='Host Port' value={hostPort} onChange={(e) => setHostPort(e.target.value)} />
      <Button appearance='subtle' icon={<Wifi124Regular />} onClick={detectAddress}>
        Detect Address
      </Button>
      <div className='flex flex-row space-x-2 justify-end'>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button appearance='primary' onClick={save}>Save</Button>
      </div>
    </div>
  );
};

export default Settings;