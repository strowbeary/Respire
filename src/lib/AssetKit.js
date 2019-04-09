export function AssetLoader() {
    const eventBus = new EventTarget();
    let loaded_assets = 0;

    async function watch_progress(promise, length) {
        return promise.then((res) => {
            loaded_assets++;
            eventBus.dispatchEvent(new CustomEvent("progress", {
                detail: {
                    loaded: loaded_assets,
                    total: length
                }
            }))
            return res
        })
    }

    return {
        load: promise_array => {
            return Promise.all(
                promise_array
                    .map(promise => watch_progress(promise, promise_array.length))
            );
        },
        addEventListener: (...params) => eventBus.addEventListener(...params),
        removeEventListener: (...params) => eventBus.removeEventListener(...params)
    }
}
