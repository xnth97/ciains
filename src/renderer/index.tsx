import { render } from 'react-dom';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import App from './App';

initializeIcons();

render(
  <App />,
  document.getElementById('root')
);
