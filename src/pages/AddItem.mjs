import Modal from "../components/Modal.mjs";
import Preview from "../components/Preview.mjs";
import RichTextEditor from "../components/RichTextEditor.mjs";
import {css} from "../deps/goober.mjs";
import mammoth from "../deps/mammoth.mjs";
import { createMobiledocFromString, EMPTY_MOBILEDOC } from "../deps/mobiledoc.mjs";
import { reactive } from "../deps/vue.mjs";
import { importedWalks, items } from "../services/items.mjs";
import { diff_match_patch } from "../deps/diff-match-patch.mjs";

const dmp = new diff_match_patch();

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

const grabWalkData = async (arrayBuffer) => {
    const { value: walkHtml } = await mammoth.convertToHtml({ arrayBuffer });
    const dummyDomRoot = document.createElement('div');
    dummyDomRoot.innerHTML = walkHtml;
    console.log(walkHtml);
    const [title, ...subtitleArr] = Array.from(dummyDomRoot.querySelectorAll('h2')).map(title => title.textContent);
    const details = Array.from(dummyDomRoot.querySelectorAll('h3')).map((detail, id) => {
        const [name, ...valueArr] = detail.textContent.trim().split(':');
        return { id: Date.now() + '' + id, name: toTitleCase(name), value: createMobiledocFromString(valueArr.join(':').trim()) }
    });
    const content = dummyDomRoot.querySelectorAll('h3:last-of-type ~ *');
    console.log(title, subtitleArr, details, content);
}

const getSlug = (str) => str.toLowerCase().replace(/\s/g, '-');

const createWalk = () => reactive({ series: '', title: '', subtitle: '', details: [{ id: Date.now(), name: '', value: EMPTY_MOBILEDOC }], portraitMap: false, content: EMPTY_MOBILEDOC, image: '' });

const fetchOrCreateWalk = (id) => {
    const walk = createWalk();
    if (typeof id !== 'string' || id.length === 0 || !importedWalks.value.has(id)) return walk;
    const importedWalk = importedWalks.value.get(id);
    const { series, title, subtitle, details, portraitMap, content, image } = importedWalk.walk;
    Object.assign(walk, { title, subtitle, content: createMobiledocFromString(content) });
    walk.details = details.map(({ key, value }) => ({ id: Date.now(), name: key, value: createMobiledocFromString(value) }));
    if (series) {
        const truncatedSeries = series.slice(0, dmp.Match_MaxBits);
        const matchingSeries = items.map(series => [series, dmp.match_main(series.title, truncatedSeries, 0)]).filter(([_, score]) => score >= 0);
        if (matchingSeries.length > 0) {
            const scoredMatches = matchingSeries.map(([series]) => [series, dmp.diff_levenshtein(dmp.diff_main(series.title, truncatedSeries))]);
            const [[bestMatchSeries]] = scoredMatches.sort(([, a], [, b]) => a - b);
            walk.series = bestMatchSeries.slug;
        }
    }
    return walk;
};

const VIEW_STATES = {
    READY: 'READY',
    SUBMITTING: 'SUBMITTING',
    SUBMITTED: 'SUBMITTED',
};

export default {
    name: 'CreateWalk',
    props: ['importId'],
    components: { Preview, RichTextEditor, Modal },
    data: (vm) => ({ walk: fetchOrCreateWalk(vm.importId), walkSeries: items, importedWalks, state: VIEW_STATES.READY }),
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
                                        <p>The walk has been created!</p>
                                        <p>Wait a little while and it will be available at <a :href="getWalkUrl()">{{walkSeries.find(({ slug }) => slug === walk.series).title}} | {{walk.title}}</a></p>
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
                                    <button class="btn btn-primary ms-auto" :disabled="state === '${VIEW_STATES.SUBMITTING}'" @click="submitWalk">{{state === '${VIEW_STATES.READY}' ? 'Upload walk' : 'Uploading...'}}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Modal v-if="importedWalkHasChanges && false" v-model:show="showChangesModal">
            <div v-for="(changeHtml, i) in importedWalkChanges.content" :key="changeHtml" v-html="changeHtml"></div>
        </Modal>
        <Preview :series="walk.series" :title="walk.title" :subtitle="walk.subtitle" :details="walk.details" :content="walk.content" :image="imageSrc" />`,
    computed: {
        importedWalk() {
            if (!this.importId || !this.importedWalks.has(this.importId)) return null;
            const importedWalk = this.importedWalks.get(this.importId);
            return importedWalk;
            return { ...importedWalk, changes: {"content":[{"diffs":[{"0":0,"1":"From t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" Queens "}],"start1":0,"start2":0,"length1":16,"length2":16},{"diffs":[{"0":0,"1":"oad to t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" roundab"}],"start1":73,"start2":73,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"n with t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" A259.**"}],"start1":102,"start2":102,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"eft to t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" River R"}],"start1":130,"start2":130,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"iver Rot"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":"r Bridge"}],"start1":142,"start2":142,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"066 Walk along t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" edge of a green"}],"start1":204,"start2":204,"length1":34,"length2":34},{"diffs":[{"0":0,"1":"en. At t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" end of "}],"start1":236,"start2":236,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"end of t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" green l"}],"start1":247,"start2":247,"length1":18,"length2":18},{"diffs":[{"0":0,"1":" leave t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" 1066 Wa"}],"start1":263,"start2":263,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"dings, t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":"n on, wi"}],"start1":314,"start2":314,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"eft on t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" main ro"}],"start1":412,"start2":412,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"assing t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" old her"}],"start1":455,"start2":455,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"ht. At t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" roundab"}],"start1":502,"start2":502,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"follow t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" A259 ov"}],"start1":539,"start2":539,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"9 over t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" river, "}],"start1":553,"start2":553,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"river, t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":"n sharpl"}],"start1":564,"start2":564,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"right, t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":"n a post"}],"start1":674,"start2":674,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"Court (t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":"re is a "}],"start1":809,"start2":809,"length1":18,"length2":18},{"diffs":[{"0":0,"1":" park, t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":"n a hous"}],"start1":983,"start2":983,"length1":18,"length2":18},{"diffs":[{"0":0,"1":" along t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" edge of"}],"start1":1141,"start2":1141,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"ht all t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" way to "}],"start1":1241,"start2":1241,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"sly on t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" hill ah"}],"start1":1287,"start2":1287,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"s head for t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" hill. On yo"}],"start1":1315,"start2":1315,"length1":26,"length2":26},{"diffs":[{"0":0,"1":"ost of t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" way is "}],"start1":1355,"start2":1355,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"called t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" Padiam "}],"start1":1382,"start2":1382,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"hes at t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" far sid"}],"start1":1590,"start2":1590,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"till along t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" field edge."}],"start1":1720,"start2":1720,"length1":26,"length2":26},{"diffs":[{"0":0,"1":"**When t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" sewer s"}],"start1":1750,"start2":1750,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"forward across t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" open field. Do "}],"start1":1798,"start2":1798,"length1":34,"length2":34},{"diffs":[{"0":0,"1":"ad for t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" hill ah"}],"start1":1867,"start2":1867,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"across t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" open fi"}],"start1":1948,"start2":1948,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"aching t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" field i"}],"start1":2004,"start2":2004,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"ont of t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" caravan"}],"start1":2026,"start2":2026,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"across t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" corner,"}],"start1":2063,"start2":2063,"length1":18,"length2":18},{"diffs":[{"0":0,"1":" along t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" road to"}],"start1":2175,"start2":2175,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"paces, t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":"n right "}],"start1":2240,"start2":2240,"length1":18,"length2":18},{"diffs":[{"0":0,"1":" again, on t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" 1066 Way. C"}],"start1":2257,"start2":2257,"length1":26,"length2":26},{"diffs":[{"0":0,"1":"around t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" foot of"}],"start1":2411,"start2":2411,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"oot of t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" hill. A"}],"start1":2423,"start2":2423,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"ing on t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" 1066 Wa"}],"start1":2473,"start2":2473,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"o past t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" house t"}],"start1":2606,"start2":2606,"length1":18,"length2":18},{"diffs":[{"0":0,"1":" up to t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" New Inn"}],"start1":2706,"start2":2706,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"nn and t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" end of "}],"start1":2722,"start2":2722,"length1":18,"length2":18},{"diffs":[{"0":0,"1":"end of t"},{"0":-1,"1":"h"},{"0":0,"1":"e"},{"0":1,"1":"h"},{"0":0,"1":" section"}],"start1":2733,"start2":2733,"length1":18,"length2":18}]} };
        },
        importedWalkHasChanges() {
            if (!this.importedWalk) return false;
            const { changes } = this.importedWalk;
            console.log(changes);
            return Object.keys(changes).length > 0;
        },
        importedWalkChanges() {
            if (!this.importedWalkHasChanges) return null;
            const { walk, changes } = this.importedWalk;
            const diffHtmls = {};
            Object.keys(changes).forEach(key => {
                const content = walk[key];
                diffHtmls[key] = changes[key].map(patch => {
                    console.log(patch);
                    const patchedContent = dmp.patch_apply([patch], content);
                    console.log(patchedContent);
                    const diff = dmp.diff_main(patchedContent[0], content);
                    console.log(diff);
                    const excerptEdges = 200;
                    if (diff[0][0] === 0) {
                        const diffStart = diff[0][1].slice(excerptEdges * -1).trim();
                        diff[0][1] = diffStart.length !== diff[0][1].length ? '...' + diffStart : diffStart;
                    }
                    if (diff.at(-1)[0] === 0) {
                        const diffEnd = diff.at(-1)[1].slice(0, excerptEdges);
                        diff.at(-1)[1] = diffEnd.length !== diff.at(-1)[1].length ? diffEnd + '...' : diffEnd;
                    }
                    return dmp.diff_prettyHtml(diff);
                });
            });
            console.log(diffHtmls);
            return diffHtmls;
        },
        imageSrc() {
            return `data:${this.walk.image.type};base64,${this.walk.image.data}`;
        }
    },
    watch: {
        importedWalkHasChanges: {
            handler(newValue, oldValue) {
                if (newValue === oldValue) return;
                this.importedWalkChanges;
                this.showChangesModal = true;
            },
            immediate: true,
        },
    },
    methods: {
        removeDetail(id) {
            this.walk.details.splice(this.walk.details.findIndex(({ id: needleId }) => needleId === id), 1);
        },
        async handleDroppedFile(event) {
            this.dragover = false;
            if ('dataTransfer' in event) {
                const { dataTransfer: { files } } = event;
                if (files[0].type === 'application/msword') return this.showLegacyAlert = true;
                if (files[0].type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return;
                grabWalkData(await files[0].arrayBuffer());
            }
        },
        async handleMapFile(event) {
            const { files: [image] } = event.target;
            if (image.type.indexOf('image') === -1) return; // TODO: Error user feedback
            console.log(image);
            const reader = new FileReader();
            reader.onloadend = () => {
                this.walk.image = {
                    type: image.type,
                    data: reader.result.replace('data:', '').replace(/^.+,/, ''),
                };
                const renderedImage = new Image();
                renderedImage.src = this.imageSrc;
                renderedImage.onload = () => {
                    const { width, height } = renderedImage;
                    this.walk.portraitMap = width < height;
                };
            };
            reader.readAsDataURL(image);
        },
        async submitWalk() {
            const { walk } = this;
            if (!walk.series || !walk.title) {
                alert('You MUST select a Walk Series and enter a Walk Title to add a walk');
                return;
            }
            this.state = VIEW_STATES.SUBMITTING;
            await fetch('/api/upload-walk', {
                method: 'POST',
                body: JSON.stringify(walk),
                credentials: 'same-origin'
            });
            this.state = VIEW_STATES.SUBMITTED;
        },
        getWalkUrl() {
            const { walk: { series, title }} = this;
            return `https://robustrambles.co.uk/walks/${getSlug(series)}/${getSlug(title)}`;
        },
        resetAddWalk() {
            window.location.reload();
        }
    },
}