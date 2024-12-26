// const NetWorkFn = () => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve("success");
//     }, 1000);
//   });
// };

// async function getUser() {
//   return await NetWorkFn();
// }

// async function getInfo() {
//   const user = await getUser();
//   console.log(`user:${user}`);
//   return user;
// }

// async function main() {
//   const info = await getInfo();
//   console.log(`info:${info}`);
// }

// main();

// const NetWorkFn = () => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve("success");
//     }, 1000);
//   });
// };

// const transToSync =
//   (fn) =>
//   (...args) => {
//     let cache = {
//       status: "pending",
//       value: null,
//     };
//     const newFn = (...args) => {
//       if (cache.status === "fulfilled") {
//         return cache.value;
//       }
//       if (cache.status === "rejected") {
//         throw cache.value;
//       }
//       const p = fn(...args).then(
//         (res) => {
//           cache.status = "fulfilled";
//           cache.value = res;
//         },
//         (err) => {
//           cache.status = "rejected";
//           cache.value = err;
//         }
//       );
//       throw p;
//     };
//     try {
//       newFn(...args);
//     } catch (e) {
//       if (e instanceof Promise) {
//         e.finally(() => {
//           newFn(...args);
//         });
//       }
//     }
//     return new Promise((resolve, reject) => {
//       fn().then(resolve, reject);
//     });
//   };

// const asyncNetWorkFn = transToSync(NetWorkFn);

// function getUser() {
//   return asyncNetWorkFn();
// }

// function getInfo() {
//   const user = getUser();
//   console.log(`user:${user}`);
//   return user;
// }

// function main() {
//   const info = getInfo();
//   console.log(`info:${info}`);
// }

// main();

class Suspendable {
    constructor(promise) {
      this.status = "pending";
      this.result = null;
  
      // 处理 Promise 的结果
      promise
        .then((result) => {
          this.status = "fulfilled";
          this.result = result;
        })
        .catch((error) => {
          this.status = "rejected";
          this.result = error;
        });
  
      this.promise = promise;
    }
  
    read() {
      if (this.status === "pending") {
        throw this.promise; // 抛出 Promise 暂停执行
      } else if (this.status === "rejected") {
        throw this.result; // 抛出错误
      } else if (this.status === "fulfilled") {
        return this.result; // 返回成功结果
      }
    }
  }
  
  const NetWorkFn = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("success");
      }, 1000);
    });
  };
  
  // 包装 NetWorkFn
  function wrapNetworkFn() {
    const suspendable = new Suspendable(NetWorkFn());
    return suspendable;
  }
  
  // 使用同步风格的 getUser
  const userResource = wrapNetworkFn();
  
  function getUserSync() {
    return userResource.read(); // 使用 read 来同步获取数据
  }
  
  function getInfoSync() {
    const user = getUserSync();
    console.log(`user:${user}`);
    return user;
  }
  
  function mainSync() {
    try {
      const info = getInfoSync();
      console.log(`info:${info}`);
    } catch (promise) {
      if (typeof promise.then === "function") {
        promise.then(() => mainSync()); // 等待完成后重新调用
      } else {
        console.error("An unexpected error occurred:", promise);
      }
    }
  }
  
  // 执行
  mainSync();
  