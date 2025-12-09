import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchByThunk, fetchByDedupe, pushEvent, clearEvents, setLoading } from './requestSlice';
import { fetchWithDedupe, fakeFetch, fetchWithPolicy } from './requestManager';
import { useGetDataQuery } from './rtkQueryApi';

const Demo: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const events = useSelector((s: RootState) => s.requests.events);
  const loading = useSelector((s: RootState) => s.requests.loading);
  const [key, setKey] = useState('A');
  const [rtkKey, setRtkKey] = useState('A');

  const triggerBadDedupe = () => {
    // 错误示例：用 redux.loading 做去重（非原子，容易漏）
    if (loading) {
      console.log('[bad dedupe] blocked by loading flag');
      dispatch(pushEvent({ id: 'bad-block', key, ts: Date.now(), source: 'bad-dedupe-block' }));
      return;
    }
    // set loading true immediately (but不原子) 并触发 async 操作
    dispatch(setLoading(true));
    // 模拟请求
    fakeFetch(key).then((res) => {
      dispatch(pushEvent({ id: `bad:${Date.now()}`, key: res.key, ts: res.ts, source: 'bad-dedupe-res' }));
      dispatch(setLoading(false));
    });
  };

  const triggerThunk = () => {
    // 直接 dispatch thunk 两次观察 pending/fulfilled 顺序
    dispatch(fetchByThunk(key));
  };

  const triggerDedupe = async () => {
    // 使用手工 dedupe 的 thunk
    dispatch(fetchByDedupe(key));
  };

  const triggerManualDedupeDirect = async () => {
    // 直接使用 requestManager.fetchWithDedupe 返回同一 promise
    const p = fetchWithDedupe(key).then((res) => {
      dispatch(pushEvent({ id: `manual:${Date.now()}`, key: res.key, ts: res.ts, source: 'manual-direct' }));
    });
    // 为了演示可以同时触发两次
    fetchWithDedupe(key).then((res) => {
      dispatch(pushEvent({ id: `manual2:${Date.now()}`, key: res.key, ts: res.ts, source: 'manual-direct-2' }));
    });
    await p;
  };

  const triggerPolicyCancelPrev = async () => {
    // A-B-A 场景：先发 A，然后发 B（不同 key），再发 A，观察 dedupe vs cancelPrevious 行为
    const aKey = key;
    const bKey = key + '-B';
    // 发第一个 A
    fetchWithDedupe(aKey).then((res) => dispatch(pushEvent({ id: `a1:${Date.now()}`, key: res.key, ts: res.ts, source: 'A-1' })));
    // 发 B
    fetchWithDedupe(bKey).then((res) => dispatch(pushEvent({ id: `b:${Date.now()}`, key: res.key, ts: res.ts, source: 'B' })));
    // 再次发 A，使用 cancelPrevious 策略示例
    fetchWithPolicy(aKey, 'dedupe').then((res) => dispatch(pushEvent({ id: `a2-dedupe:${Date.now()}`, key: res.key, ts: res.ts, source: 'A-2-dedupe' })));
    fetchWithPolicy(aKey, 'cancelPrevious').then((res) => dispatch(pushEvent({ id: `a2-cancel:${Date.now()}`, key: res.key, ts: res.ts, source: 'A-2-cancel' }))).catch((e) => console.log('a2-cancel error', e.message));
  };

  // RTK Query usage demo
  const { data: rtkData, isLoading: rtkLoading } = useGetDataQuery(rtkKey);

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label>key: <input value={key} onChange={(e) => setKey(e.target.value)} /></label>
        <button onClick={triggerBadDedupe}>Bad dedupe via redux.loading</button>
        <button onClick={() => { triggerThunk(); triggerThunk(); }}>Dispatch thunk twice</button>
        <button onClick={triggerDedupe}>Dispatch dedupe-thunk twice</button>
        <button onClick={triggerManualDedupeDirect}>Manual dedupe (direct)</button>
        <button onClick={triggerPolicyCancelPrev}>A-B-A demo (dedupe vs cancelPrevious)</button>
      </div>

      <hr />

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label>RTK key: <input value={rtkKey} onChange={(e) => setRtkKey(e.target.value)} /></label>
        <button onClick={() => { /* reading rtkQuery hook will auto trigger */ }}>Fetch via RTK Query</button>
        <div>RTK status: {rtkLoading ? 'loading' : 'idle'} {rtkData ? `data(${rtkData.key}@${rtkData.ts})` : ''}</div>
      </div>

      <hr />

      <div>
        <button onClick={() => dispatch(clearEvents())}>Clear events</button>
        <div style={{ marginTop: 8 }}>
          <h3>Events (最新在上)</h3>
          <ul>
            {events.map((e) => (
              <li key={e.id} style={{ fontFamily: 'monospace' }}>{new Date(e.ts).toLocaleTimeString()} [{e.source}] {e.key}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Demo;
