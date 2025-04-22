export { createApp, ref, reactive, h, watchEffect, watch, markRaw, computed } from 'https://unpkg.com/vue@3.2.37/dist/vue.esm-browser.prod.js'
import { watchEffect } from 'https://unpkg.com/vue@3.2.37/dist/vue.esm-browser.prod.js';

export const mapRefs = (refs) => {
    const mappedRefs = {};
    for ( const refName in refs) {
        mappedRefs[refName] = () => refs[refName].value;
    }
    return mappedRefs;
}

export const persistRef = (ref, persistKey, permanently = false) => {
    const storage = permanently ? window.localStorage : window.sessionStorage;
    if (persistKey in storage) {
        if (ref.value instanceof Map) {
            const persistedValue = JSON.parse(storage.getItem(persistKey));
            if (Array.isArray(persistedValue)) {
                ref.value = new Map(persistedValue);
            }
        } else {
            ref.value = JSON.parse(storage.getItem(persistKey));
        }
    }
    watchEffect(() => {
        let storeValue = ref.value;
        if (ref.value instanceof Map) {
            storeValue = Array.from(ref.value.entries());
        }
        storage.setItem(persistKey, JSON.stringify(storeValue))
    });
}