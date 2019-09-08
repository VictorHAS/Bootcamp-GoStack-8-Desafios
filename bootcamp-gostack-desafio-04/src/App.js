import React, { Component } from 'react';

import { Header, PostList } from './Components';

class App extends Component {
  render() {
    return (
      <>
        <Header />
        <PostList />
      </>
    );
  }
}

export default App;
