import Modal from "../components/Modal.mjs";
import Alert from "../components/Alert.mjs";
import {css} from "../deps/goober.mjs";
import { reactive } from "../deps/vue.mjs";
import { items, itemMap } from "../services/items.mjs";

const styles = css`
    .card-body > * {
        transition: 0.125s opacity ease-in-out !important;
    }
`;

const getNewItemId = () => {
    const itemsClone = Array.from(items);
    itemsClone.sort(({ id: a }, { id: b }) => a > b ? 1 : -1);
    const { id } = itemsClone.at(-1);
    const match = id.match(/([A-Z])(\d+)/);
    return match ? `${match[1]}${String(parseInt(match[2]) + 1).padStart(4, '0')}` : 'A0000';
}

const createItem = () => reactive({ id: '', folder: '', title: '', description: '', keywords: [''], timestamp: '', type: '', comments: '' });

const fetchOrCreateItem = (id) => {
    const item = createItem();
    if (typeof id !== 'string' || id.length === 0 || !itemMap.value.has(id)) {
        item.id = getNewItemId();
        return item;
    }
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
    components: { Modal, Alert },
    data: (vm) => ({ item: fetchOrCreateItem(vm.id), state: VIEW_STATES.READY, error: null }),
    template: `
        <div class="container-xl">
            <div class="page-header d-print-none">
                <div class="row g-2 align-items-center">
                    <div class="col">
                        <h2 class="page-title">
                            {{id ? 'Update' : 'Add'}} item
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
                                        <button class="btn btn-primary ms-auto" @click="resetAddItem">Add another item</button>
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
                <Alert heading="An error occurred" level="danger" v-if="error">{{error}}</Alert>
                <div class="row row-cards">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <label class="form-label">ID</label>
                                            <div class="row g-2 mb-3">
                                                <div class="col-4">
                                                    <input type="text" class="form-control" v-model="item.id" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Folder</label>
                                            <div class="row g-2 mb-3" >
                                                <div class="col-4">
                                                    <input type="text" class="form-control" placeholder="Folder identifier" v-model="item.folder" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Title</label>
                                            <div class="row g-2 mb-3">
                                                <div class="col-4">
                                                    <input type="text" class="form-control" placeholder="Title" v-model="item.title" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <div class="form-label">Description</div>
                                            <textarea class="form-control" placeholder="Write..." v-model="item.description"></textarea>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Keywords</label>
                                            <div class="row g-2 mb-3" v-for="(keyword, index) in item.keywords" :key="index">
                                                <div class="col-11">
                                                    <input type="text" class="form-control" placeholder="Keyword" v-model="item.keywords[index]" />
                                                </div>
                                                <div class="col-1">
                                                    <button class="btn btn-icon" aria-label="Remove row" @click="removeKeyword(index)">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                                                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="d-flex justify-content-center">
                                                <button class="btn btn-icon" @click="item.keywords.push('')">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                                                        <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Time and date information</label>
                                            <div class="row g-2 mb-3">
                                                <div class="col-4">
                                                    <input type="text" class="form-control" placeholder="Time and date" v-model="item.timestamp" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Type</label>
                                            <div class="row g-2 mb-3">
                                                <div class="col-4">
                                                    <input type="text" class="form-control" placeholder="Type" v-model="item.type" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <div class="form-label">Comments</div>
                                            <textarea class="form-control" placeholder="Write..." v-model="item.comments"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer text-end">
                                <div class="d-flex">
                                    <button class="btn btn-primary ms-auto" :disabled="state === '${VIEW_STATES.SUBMITTING}'" @click="submitItem">{{state === '${VIEW_STATES.READY}' ? 'Upload item' : 'Uploading...'}}</button>
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
            const response = await fetch('/api/upsert-item', {
                method: 'POST',
                body: JSON.stringify(item),
                credentials: 'same-origin'
            });
            if (!response.ok) {
                this.error = await response.json();
                console.error(this.error);
                this.state = VIEW_STATES.READY;
                return;
            }
            this.state = VIEW_STATES.SUBMITTED;
        },
        removeKeyword(index) {
            this.item.keywords.splice(index, 1);
        },
        resetAddItem() {
            window.location.reload();
        }
    },
}