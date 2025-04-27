import { reactive, computed } from "../deps/vue.mjs";
import { Document } from "../deps/flexsearch.mjs";

export const items = reactive([]);

export const itemMap = computed(() => new Map(items.map(item => [item.id, item])));

export const searchIndex = new Document({
    tokenize: 'full',
    document: {
        id: 'id',
        index: ['title', 'description', 'keywords', 'timestamp', 'type', 'comments']
    }
});

const itemDataResponse = await fetch('https://andrewbridge.github.io/heritage-archive-prototype/data.json').then(r => r.json());
items.push(...itemDataResponse);

for (const item of items) {
    searchIndex.add(item)
}