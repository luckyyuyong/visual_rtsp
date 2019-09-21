import React from 'react';

import {BrowserRouter as Router, Route} from 'react-router-dom';
import Video from './components/Video';
import Visual from './components/Visual';

const Routes = props => (
  <Router {...props}>
    <div>
      <Route path="/" component={Visual} />
      <Route path="/" component={Video} />
    </div>
  </Router>
);

export default Routes;
