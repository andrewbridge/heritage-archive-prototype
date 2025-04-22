import { css } from "../deps/goober.mjs"

const styles = css`
    img {
        max-width: 100px;
    }
`;

export default {
    template: `
    <div class="page-body ${styles}">
            <div class="container container-tight py-4">
                <div class="card card-md">
                <div class="card-body">
                    <h2 class="h2 text-center mb-4">Login</h2>
                    <div class="mb-2 text-center">
                        <img src="/imgs/github-logo.svg" />
                    </div>
                    <div class="form-footer">
                        <a href="https://github.com/login/oauth/authorize?client_id=Ov23lijTKP84oxkQ6ogs&scope=repo" class="btn btn-primary w-100">Sign in with GitHub</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`,
}