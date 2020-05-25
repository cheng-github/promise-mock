// 实现一个可通过 A+ 测试的 Promise
const PEDDING = 0;
const FUFILLED = 1;
const REJECTED = 2;
const IS_ERROR =  {};
var LAST_ERROR = null;

function empty() {

}

function Promise(fn) {
    this.state = PEDDING;
    this.deferred = [];
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
        LAST_ERROR = e;
    }
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
            reject(promise, LAST_ERROR);
            return;
        }
        if (then === promise.then && value instanceof Promise) {
            
        }
    }

    
    promise.state = FUFILLED;
    promise.value = value;
    doHandler(promise, value);
}

function reject(promise, reason) {
    promise.state = REJECTED;
    promise.value = reason;
    doHandler(promise, promise.deferred);
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
    if (promise.state === PEDDING) {
        promise.deferred.push(deferred);
        return;
    }
    
    doHandler(promise, [deferred]);
}

function doHandler(promise, deferreds) {
    if (deferreds.length === 0) {
        return;
    }
    let isFulfilled = promise.state === FUFILLED;
    for (let task of deferreds) {
        // 整体逻辑需异步处理，如果在最后调用的时候才使用异步，就无法获取到调用的结果传递给下一个 promise
        setTimeout(function() {
            let fn = isFulfilled ? task.fuifilled : task.rejected;
            if (!fn) {
                isFulfilled ? resolve(promise, promise.value) : reject(promise, promise.value);
            } else {
                try {
                    let result = fn(promise.value);
                    resolve(promise, result);
                } catch (e) {
                    reject(promise, e);
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


