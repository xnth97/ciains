import { render } from 'react-dom';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import App from './App';

initializeIcons();

render(
  <FluentProvider theme={webLightTheme}>
    <App />
  </FluentProvider>,
  document.getElementById('root')
);
