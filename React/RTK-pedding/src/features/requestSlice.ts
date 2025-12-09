import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fakeFetch, fetchWithDedupe } from './requestManager';

export type ReqEvent = { id: string; key: string; ts: number; source: string };
interface RootState {
    requests: {
        something: string;
    };
}

export const fetchByThunk = createAsyncThunk<{ key: string; ts: number }, string, { state: RootState }>('requests/fetchByThunk', async (key: string, thunkAPI) => {
    // 这段代码运行在 pending 之后（createAsyncThunk 会先 dispatch pending）
    const state = thunkAPI.getState();
    console.log('thunk0');
    if (state.requests.loading) {
        console.log('thunk1 ');
        return { key: '111', ts: 222 }
    }
    const res = await fakeFetch(key);
    console.log('thunk3');
    return { key: res.key, ts: res.ts };
});

export const fetchByDedupe = createAsyncThunk('requests/fetchByDedupe', async (key: string) => {
    // 使用手工去重（in-flight map）
    const res = await fetchWithDedupe(key);
    return { key: res.key, ts: res.ts };
});

type RequestsState = {
    events: ReqEvent[];
    loading: boolean; // 用于演示“错误”的 redux.loading 去重
};

const initialState: RequestsState = { events: [], loading: false };

const slice = createSlice({
    name: 'requests',
    initialState,
    reducers: {
        pushEvent(state, action: PayloadAction<ReqEvent>) {
            state.events.unshift(action.payload);
            if (state.events.length > 100) state.events.pop();
        },
        clearEvents(state) {
            state.events = [];
        },
        // 演示: 手动 set loading（bad dedupe 逻辑会检查这个）
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchByThunk.pending, (state, action) => {
                // pending 是立刻 dispatch 的 —— 我们可以在这里记录
                state.loading = true;
                state.events.unshift({ id: `pending:${action.meta.requestId}`, key: action.meta.arg, ts: Date.now(), source: 'thunk-pending' });
            })
            .addCase(fetchByThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.events.unshift({ id: `fulfilled:${action.meta.requestId}`, key: action.payload.key, ts: action.payload.ts, source: 'thunk-fulfilled' });
            })
            .addCase(fetchByThunk.rejected, (state, action) => {
                state.loading = false;
                state.events.unshift({ id: `rejected:${action.meta.requestId}`, key: action.meta.arg as string, ts: Date.now(), source: 'thunk-rejected' });
            })
            .addCase(fetchByDedupe.pending, (state, action) => {
                state.events.unshift({ id: `pending:${action.meta.requestId}`, key: action.meta.arg, ts: Date.now(), source: 'dedupe-pending' });
            })
            .addCase(fetchByDedupe.fulfilled, (state, action) => {
                state.events.unshift({ id: `fulfilled:${action.meta.requestId}`, key: action.payload.key, ts: action.payload.ts, source: 'dedupe-fulfilled' });
            });
    },
});

export const { pushEvent, clearEvents, setLoading } = slice.actions;
export default slice.reducer;
