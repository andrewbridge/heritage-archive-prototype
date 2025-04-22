import { reactive, computed } from "../deps/vue.mjs";

export const items = reactive([]);

export const itemMap = computed(() => new Map(items.map(item => [item.id, item])));

const itemDataResponse = await fetch('https://andrewbridge.github.io/heritage-archive-prototype/data.json').then(r => r.json());
items.push(...itemDataResponse);
