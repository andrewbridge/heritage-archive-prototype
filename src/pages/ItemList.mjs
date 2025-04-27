import {css} from "../deps/goober.mjs";
import { items, itemMap, searchIndex } from "../services/items.mjs";

const styles = css`
.hello-world {
    color: pink;
}
`;

export default {
    name: 'ItemList',
    inject: ['router'],
    data: () => ({ items, searchQuery: '' }),
    computed: {
        shownItems() {
            if (this.searchQuery === '') return this.items;
            const results = searchIndex.search(this.searchQuery);
            const flatResults = Array.from(new Set(results.flatMap(({ result }) => result)));
            return flatResults.map(id => itemMap.value.get(id)).filter(item => typeof item !== 'undefined');
        }
    },
    template: `
    <div class="container-xl">
        <div class="page-header d-print-none">
            <div class="container-xl">
                <div class="row g-2 align-items-center">
                    <div class="col">
                        <h2 class="page-title">Item list</h2>
                    </div>
                    <!-- Page title actions -->
                    <div class="col-auto ms-auto d-print-none">
                        <div class="d-flex">
                            <input type="search" class="form-control d-inline-block w-10" placeholder="Search…" v-model="searchQuery">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="page-body ${styles}">
        <div class="container-xl">
            <div class="row row-cards">
                <div class="col-12">
                    <div class="card">
                        <div class="table-responsive">
                            <table class="table table-vcenter table-mobile-md card-table">
                                <colgroup>
                                    <col span="1" style="width: 7%;">
                                    <col span="1" style="width: 7%;">
                                    <col span="1" style="width: 40%;">
                                    <col span="1" style="width: 15%;">
                                    <col span="1" style="width: 10%;">
                                    <col span="1" style="width: 13%;">
                                    <col span="1" style="width: 7%;">
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Folder</th>
                                        <th>Details</th>
                                        <th>Keywords</th>
                                        <th>Time and date</th>
                                        <th>Comments</th>
                                        <th class="w-1"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in shownItems" :key="item.id">
                                        <td>{{ item.id }}</td>
                                        <td>{{ item.folder }}</td>
                                        <td>
                                            <div class="text-secondary font-weight-medium">{{item.title}}</div>
                                            <div>
                                                <p v-for="line in item.description.split('\\n')">{{ line }}</p>
                                            </div>
                                        </td>
                                        <td>{{item.keywords.join(', ')}}</td>
                                        <td>
                                            <p v-for="line in item.timestamp.split('\\n')">{{ line }}</p>
                                        </td>
                                        <td class="text-secondary">
                                            <p v-for="line in item.comments.split('\\n')">{{ line }}</p>
                                        </td>
                                        <td>
                                            <div class="btn-list flex-nowrap">
                                                <a :href="router.getPath('AddItem', { id: item.id })" class="btn btn-1">
                                                    Edit
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`,
}