import { render } from 'react-dom';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import App from './App';

render(
  <FluentProvider theme={webLightTheme}>
    <App />
  </FluentProvider>,
  document.getElementById('root')
);
