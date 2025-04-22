import { css } from "../deps/goober.mjs"

const styles = css`
    display: flex;
    justify-content: center;
    align-items: center;

    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.5);
    z-index: 60;

    dialog {
        position: relative;
        padding: 16px;
    }

    dialog > .close-button {
        position: absolute;
        top: 4px;
        right: 4px;
    }
`;

export default {
    props: ['show'],
    emits: ['update:show'],
    template: `
    <Teleport to="#teleport-root">
        <div class="${styles}" v-if="show">
            <dialog :open="show">
                <button class="close-button" @click="$emit('update:show', false)">X</button>
                <slot />
            </dialog>
        </div>
    </Teleport>`,
}