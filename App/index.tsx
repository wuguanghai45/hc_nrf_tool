import React from 'react';
import type { FC } from 'react';
import 'antd/dist/reset.css';

import Home from './Components/Home';

import { createRoot } from 'react-dom/client';


const App: FC = () => (
  <Home></Home>
);

document.body.innerHTML = '<div id="app"></div>';
const root = createRoot(document.getElementById('app'));
root.render(<App />);
