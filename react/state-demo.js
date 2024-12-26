let workInProgressHook;
let isMount = true;
let updateKey = 1;
const fiber = {
  memoizedState: null,
  stateNode: App,
};
function schedule() {
  workInProgressHook = fiber.memoizedState;
  const app = fiber.stateNode();
  isMount = false;
  return app;
}
function dispatchAction(queue, action) {
  const update = {
    action,
    next: null,
    key: updateKey++,
  };
  if (queue.pending === null) {
    update.next = update;
  } else {
    // 3->1->2->3
    // 4->1->2->3->4
    update.next = queue.pending.next;
    queue.pending.next = update;
  }
  queue.pending = update;
  schedule();
}

function useState(initialState, key) {
  let hook;
  if (isMount) {
    hook = {
      queue: {
        pending: null,
      },
      hookName: key,
      memoizedState: initialState,
      next: null,
    };
    if (!fiber.memoizedState) {
      fiber.memoizedState = hook;
    } else {
      workInProgressHook.next = hook;
    }
    workInProgressHook = hook;
  } else {
    hook = workInProgressHook;
    workInProgressHook = workInProgressHook.next;
  }
  let baseState = hook.memoizedState;
  if (hook.queue.pending) {
    let firstUpdate = hook.queue.pending.next;
    do {
      const action = firstUpdate.action;
      baseState = action(baseState);
      firstUpdate = firstUpdate.next;
    } while (firstUpdate !== hook.queue.pending);
    hook.queue.pending = null;
  }
  hook.memoizedState = baseState;
  return [baseState, dispatchAction.bind(null, hook.queue)];
}
function App() {
  const [num, updateNum] = useState(0, "updateNum");
  const [state, updateState] = useState(false, "updateState");
  console.log(`${isMount ? "mount" : "update"} num: `, num);
  console.log(`${isMount ? "mount" : "update"} state: `, state);
  return {
    click() {
      updateNum((num) => num + 1);
      updateState((state) => !state);
    },
  };
}
window.app = schedule();
