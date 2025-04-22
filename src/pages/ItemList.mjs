import {css} from "../deps/goober.mjs";

const styles = css`
    .hello-world {
        color: pink;
    }
`;

export default {
    name: 'WalkList',
    template: `
        <div class="container-xl">
            <div class="page-header d-print-none">
                <div class="row g-2 align-items-center">
                    <div class="col">
                        <h2 class="page-title">
                            Hello, World!
                        </h2>
                    </div>
                </div>
            </div>
        </div>
        <div class="page-body ${styles}">
            <div class="container-xl">
                <div class="row row-cards">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Hello, World!</h3>
                            </div>
                            <div class="card-body">
                                <p class="hello-world">Hello, World!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
}