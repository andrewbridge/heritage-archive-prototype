import { reactive } from "../deps/vue.mjs";

const items = reactive([]);

export default items;

const itemDataResponse = await fetch('https://andrewbridge.github.io/heritage-archive-prototype/data.json').then(r => r.json());
items.push(...itemDataResponse.walks);
