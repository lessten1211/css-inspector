import React from 'react';
import './App.css';
import { Provider } from 'react-redux';
import { store } from './store';
import Demo from './features/Demo';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="content">
        <h1>RTK Pending / Dedup Demo</h1>
        <p>演示：为什么 pending 比 thunk 内部逻辑先执行、为什么不能用 redux.loading 去重、如何正确去重，以及 RTK Query 的等价实现。</p>
        <Demo />
      </div>
    </Provider>
  );
};

export default App;
