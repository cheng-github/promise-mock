// 实现一个可通过 A+ 测试的 Promise
const PEDDING = 0;
const FUFILLED = 1;
const REJECTED = 2;

const IS_ERROR = {};
// 用了 const 真是...服了自己
var ERROR_REASON = null;

function empty() {

}

function Promise(fn) {
    this._state = PEDDING;
    this._deferreds = [];
    if (fn === empty) {
        return;
    }
    doResolve(this, fn);
}  

function getThen(value) {
    let result;
    try {
        result = value.then;
    } catch(e) {
        result = IS_ERROR;
        ERROR_REASON = e;
    }
    return result;
}

// resolve 是复杂的地方之一，因为这里需要判断各种情况的处理
function resolve(promise, value) {
    // 不可以 resolve 自己，如果这么做，那么会陷入死循环
    if (value === promise) {
        throw new TypeError("can not resolve self");
    }

    if (value && 
        (typeof value === "object" || typeof value === "function")) {
        let then = getThen(value);
        if (then === IS_ERROR) {
            reject(promise, ERROR_REASON);
            return;
        }
        // 2.3.2 adopt its state
        if (then === Promise.prototype.then && value instanceof Promise) {
            // 其实这里不可以简单的将 promise 指向 adopt 的 promise
            // 原因是，在调用 then 方法的时候，我们返回了一个 promise，同时还将这个引用存放在了
            // task 对象里面，这里仅仅是修改了第二种情况的指向，所以，正确的 adopt ，要保证两种情况都要考虑
            // 那么，我们需要使用将该 promise 的 state 置为 adopt，并保存被 adopt 的 promise，这样就可以保证每次
            // resolve 的时候，task 添加到了正确的位置上
            for (let task of promise._deferreds) {
                handle(value, task);
            }
            promise = value;
            return;
        }
        // 2.3.3.3 if then is a function
        if (typeof then === "function") {
          /* 这样写的话，我们是假设了 value.then 只会调用 resolve 或 reject，但是这是不可靠的，
             所以，此处可以复用 doResolve 的逻辑
            value.then(function(value){
                resolve(promise, value);
            }, function(reason){
                reject(promise, reason);
            }); */
            doResolve(promise, then.bind(value));
            return;
        }
    }
    // 2.3.3.4 then is not a function 
    // 2.3.4 value is not a object or function
    promise._state = FUFILLED;
    promise._value = value;
    doHandler(promise, promise._deferreds);
}

function reject(promise, reason) {
    promise._state = REJECTED;
    promise._value = reason;
    doHandler(promise, promise._deferreds);
}


function doResolve(promise, fn) {
    let changed = false;
    
    try {
        fn(function(value){
            if (!changed) {
                changed = true;
                resolve(promise, value);
            }
        }, function(value) {
            if (!changed) {
                changed = true;
                reject(promise, value);
            }
        });
    } catch(e) {
        if (!changed) {
            changed = true;
            reject(promise, e);
        }
    }
    
}

function handle(promise, deferred) {
    if (promise._state === PEDDING) {
        promise._deferreds.push(deferred);
        return;
    }
    
    doHandler(promise, [deferred]);
}

function doHandler(promise, deferreds) {
    if (deferreds.length === 0) {
        return;
    }
    let isFulfilled = promise._state === FUFILLED;
    for (let task of deferreds) {
        // 整体逻辑需异步处理，如果在最后调用的时候才使用异步，就无法获取到调用的结果传递给下一个 promise
        setTimeout(function() {
            let fn = isFulfilled ? task.fuifilled : task.rejected;
            if (!fn) {
                isFulfilled ? resolve(task.promise, promise._value) : reject(task.promise, promise._value);
            } else {
                try {
                    let result = fn(promise._value);
                    resolve(task.promise, result);
                } catch (e) {
                    reject(task.promise, e);
                }
            }
        }, 0);
    }
}


Promise.prototype.then = function(fulfilled, rejected) {
    let promise = new Promise(empty);
    let handler = new Hanlder(promise, fulfilled, rejected);
    handle(this, handler);
    return promise;
}

// 任务处理类
function Hanlder(promise, fuifilled, rejected) {
    if (typeof fuifilled !== "function") {
        fuifilled = undefined;
    }
    if (typeof rejected !== "function") {
        rejected = undefined;
    }
    this.fuifilled = fuifilled;
    this.rejected = rejected;
    this.promise = promise;
}


//This follwing content contains the ES6 extensions to the core Promises/A+ API
Promise.resolve = function(value) {
    return new Promise(function(resolve, reject) {
        resolve(value);
    });
}

Promise.reject = function(value) {
    return new Promise(function(resolve, reject){
        reject(value);
    });
}

module.exports = Promise;