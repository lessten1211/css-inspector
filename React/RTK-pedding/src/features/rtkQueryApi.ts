import { createApi } from '@reduxjs/toolkit/query/react';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import { fakeFetch } from './requestManager';

// 使用自定义 baseQuery 将 fakeFetch 包装为 RTK Query 可用的请求
const customBaseQuery = async (args: string | FetchArgs) => {
  const key = typeof args === 'string' ? args : (args as any).url || JSON.stringify(args);
  try {
    const res = await fakeFetch(key as string);
    return { data: res };
  } catch (err) {
    return { error: { status: 'CUSTOM_ERROR', error: String(err) } } as any;
  }
};

export const rtkQueryApi = createApi({
  reducerPath: 'rtkQueryApi',
  baseQuery: customBaseQuery as any,
  endpoints: (build) => ({
    getData: build.query<{ key: string; ts: number }, string>({
      query: (key) => key,
      // keepUnusedDataFor / refetchOnMount 可以演示缓存与去重
    }),
  }),
});

export const { useGetDataQuery } = rtkQueryApi;
