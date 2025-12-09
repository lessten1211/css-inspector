# RTK Pending / Dedup Demo

这是一个最小可运行的演示，用来说明并验证下面几个问题：

- 为什么 pending 会比 thunk 内部逻辑先执行
- 为什么不能用 `redux.loading` 做请求去重
- 如何正确验证请求去重逻辑
- 使用 RTK Query 的等价实现，以及更健壮的并发控制（如 A-B-A 场景）

## 目录结构

- `src/features/requestManager.ts`：模拟网络请求（支持 AbortSignal）、手工去重与策略（dedupe / cancelPrevious）。
- `src/features/requestSlice.ts`：演示用的 slice，包含 `createAsyncThunk` 示例与事件收集。
- `src/features/rtkQueryApi.ts`：RTK Query 的等价实现（基于自定义 baseQuery 调用 fakeFetch）。
- `src/features/Demo.tsx`：UI 演示，包含多种触发按钮与事件列表。
- `src/store.ts`：配置 store 并挂载 RTK Query reducer & middleware。

## 运行

项目使用 rsbuild（项目已包含脚本）。在第一次运行前请安装依赖：

```bash
# 推荐使用 pnpm（仓库已有 pnpm-lock.yaml）
pnpm install

# 启动开发模式
pnpm dev
```

然后打开浏览器（rsbuild 会自动打开），主页面包含演示面板。

## 关键结论（简要）

1) 为什么 `pending` 会比 thunk 内部逻辑先执行

- `createAsyncThunk` 的实现会先同步 dispatch 一个 `pending` action，然后再调用 payloadCreator（内部异步函数）。因此你会看到 `pending` action 在异步逻辑开始前立刻出现在 store 中。这就是为什么 UI 或中间件会先看到 pending 状态的原因。

2) 为什么不能用 `redux.loading` 做请求去重

- 简单的 `loading` flag 不是原子操作：检查 `if (loading) return` 然后 `setLoading(true)` 之间存在竞争窗口；在高并发或短时间内多次触发时，会出现两个并发请求都通过检查，导致重复请求。
- 另外，`loading` 只是全局或 slice 级别的标志，无法区分不同请求的 key（例如同时请求 A 与 B），也无法处理 `A-B-A` 这类场景。

3) 如何正确验证请求去重逻辑

- 验证思路要点：
  - 使用可观察的事件（本 demo 通过往 `events` 数组里写入事件）记录每次 `pending`、`fulfilled`、或直接的结果。通过对比事件顺序可以验证去重是否生效。
  - 用不同策略测试：`dedupe`（复用 in-flight promise）应当使重复的相同 key 返回同一结果；`cancelPrevious` 应当中止旧请求并用新请求替换之。
  - 覆盖的场景：重复触发相同 key、多 key 并发（A 与 B 同时）、A 发起后 B 发起，再次发 A（A-B-A）。

4) RTK Query 的等价实现与优点

- RTK Query 内部实现了请求去重（deduping）、缓存与基于 tag 的失效策略，能在很多场景下免去手写 in-flight 管理。我们在 `rtkQueryApi.ts` 使用 `fakeFetch` 作为 `baseQuery` 展示其行为。

## Demo 使用说明（UI）

- 在输入框里填入 key（例如 `A`），然后点击：
  - `Bad dedupe via redux.loading`：使用一个全局 `loading` flag 演示错误的去重策略。
  - `Dispatch thunk twice`：连续触发两次 `createAsyncThunk`，观察 `pending` action 是如何先被 dispatch 的。
  - `Dispatch dedupe-thunk twice`：使用基于 in-flight map 的 thunk（内部使用 fetchWithDedupe）。
  - `Manual dedupe (direct)`：直接调用 `fetchWithDedupe` 两次，两个调用会复用同一 promise。
  - `A-B-A demo (dedupe vs cancelPrevious)`：演示当先后发 A、B、再发 A 时，`dedupe` 与 `cancelPrevious` 的行为差异。
  - RTK Query 区域：输入 RTK key 并观察 `useGetDataQuery` 的加载 / 返回。

## 下一步改进建议

- 为 fakeFetch 增加可配置延时或失败率以测试重试与错误处理。
- 在演示中加入更具体的断言测试（Jest / vitest）覆盖去重策略的行为：重复请求只触发一次网络调用等。

---
如果你要我：
- 我可以把这个 demo 调整为纯 JS（去掉 TS 类型错误），并在当前环境下直接运行验证；
- 或者我可以添加自动化测试（vitest）覆盖上面关键场景（happy + A-B-A）。
# Rsbuild project

## Setup

Install the dependencies:

```bash
pnpm install
```

## Get started

Start the dev server, and the app will be available at [http://localhost:3000](http://localhost:3000).

```bash
pnpm dev
```

Build the app for production:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

## Learn more

To learn more about Rsbuild, check out the following resources:

- [Rsbuild documentation](https://rsbuild.rs) - explore Rsbuild features and APIs.
- [Rsbuild GitHub repository](https://github.com/web-infra-dev/rsbuild) - your feedback and contributions are welcome!
