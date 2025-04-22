import Modal from "../components/Modal.mjs";
import {css} from "../deps/goober.mjs";
import { reactive } from "../deps/vue.mjs";
import { items, itemMap } from "../services/items.mjs";

const styles = css`
    .card-body > * {
        transition: 0.125s opacity ease-in-out !important;
    }
`;

const toTitleCase = (str) => str.replace(/\s+/g, ' ').split(' ').map(word => {
    const matches = word.match(/(.*?)([A-Za-z])(.+?)$/);
    if (matches === null) return word;
    const [_, pre, capital, rest] = matches;
    return pre + capital.toUpperCase() + rest.toLowerCase();
}).join(' ');

const createItem = () => reactive({ series: '', title: '', subtitle: '', details: [{ id: Date.now(), name: '', value: EMPTY_MOBILEDOC }], portraitMap: false, content: EMPTY_MOBILEDOC, image: '' });

const fetchOrCreateItem = (id) => {
    const item = createItem();
    if (typeof id !== 'string' || id.length === 0 || !itemMap.value.has(id)) return item;
    return itemMap.value.get(id);
};

const VIEW_STATES = {
    READY: 'READY',
    SUBMITTING: 'SUBMITTING',
    SUBMITTED: 'SUBMITTED',
};

export default {
    name: 'AddItem',
    props: ['id'],
    components: { Modal },
    data: (vm) => ({ item: fetchOrCreateItem(vm.id), state: VIEW_STATES.READY }),
    template: `
        <div class="container-xl">
            <div class="page-header d-print-none">
                <div class="row g-2 align-items-center">
                    <div class="col">
                        <h2 class="page-title">
                            Add walk
                        </h2>
                    </div>
                </div>
            </div>
        </div>
        <div class="page-body" v-if="state === '${VIEW_STATES.SUBMITTED}'">
            <div class="container-xl">
                <div class="row row-cards">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-12 text-center">
                                        <p>The item has been {{id ? 'updated' : 'created'}}!</p>
                                        <button class="btn btn-primary ms-auto" @click="resetAddWalk">Add another walk</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="page-body ${styles}" v-else>
            <div class="container-xl">
                <div class="row row-cards">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <label class="form-label">Walk Series</label>
                                            <div class="row g-2 mb-3">
                                                <div class="col-5">
                                                    <select class="form-select" v-model="walk.series">
                                                        <option disabled selected value="">Select a series</option>
                                                        <option v-for="series in walkSeries" :key="series.slug" :value="series.slug">{{series.title}}</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Title</label>
                                            <div class="row g-2 mb-3">
                                                <div class="col-4">
                                                    <input type="text" class="form-control" placeholder="Title" v-model="walk.title" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Subtitle</label>
                                            <div class="row g-2 mb-3" >
                                                <div class="col-4">
                                                    <input type="text" class="form-control" placeholder="Subtitle" v-model="walk.subtitle" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Details</label>
                                            <div class="row g-2 mb-3" v-for="detail in walk.details" :key="detail.id">
                                                <div class="col-4">
                                                    <input type="text" class="form-control" placeholder="Name" v-model="detail.name" />
                                                </div>
                                                <div class="col-7">
                                                    <RichTextEditor placeholder="Information" v-model="detail.value" />
                                                </div>
                                                <div class="col-1">
                                                    <button class="btn btn-icon" aria-label="Remove row" @click="removeDetail(detail.id)">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                                                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="d-flex justify-content-center">
                                                <button class="btn btn-icon" @click="walk.details.push({ id: Date.now(), name: '', value: '' })">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                                                        <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <div class="form-label">Walk description</div>
                                            <RichTextEditor placeholder="Write..." v-model="walk.content" />
                                        </div>
                                        <div class="mb-3">
                                            <div class="form-label">Walk map</div>
                                            <div class="row g-2 mb-3">
                                                <div class="col-5">
                                                    <input type="file" class="form-control" @change="handleMapFile" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer text-end">
                                <div class="d-flex">
                                    <button class="btn btn-primary ms-auto" :disabled="state === '${VIEW_STATES.SUBMITTING}'" @click="submitItem">{{state === '${VIEW_STATES.READY}' ? 'Upload walk' : 'Uploading...'}}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
    methods: {
        async submitItem() {
            const { item } = this;
            this.state = VIEW_STATES.SUBMITTING;
            await fetch('/api/upsert-item', {
                method: 'POST',
                body: JSON.stringify(item),
                credentials: 'same-origin'
            });
            this.state = VIEW_STATES.SUBMITTED;
        },
        resetAddWalk() {
            window.location.reload();
        }
    },
}