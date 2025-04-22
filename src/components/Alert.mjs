import AlertCircle from "./icons/AlertCircle.mjs"
import AlertTriangle from "./icons/AlertTriangle.mjs"
import Check from "./icons/Check.mjs"
import InfoCircle from "./icons/InfoCircle.mjs"

export default {
    name: "Alert",
    props: ['heading', 'level', 'dismissable'],
    components: { AlertCircle, Check, AlertTriangle, InfoCircle },
    template: /* html */`
    <div class="alert alert-important" :class="{ 'alert-dismissible': dismissable }" :class="'alert-' + level" role="alert">
        <div class="alert-icon">
            <AlertCircle v-if="level === 'danger'" />
            <Check v-else-if="level === 'success'" />
            <AlertTriangle v-else-if="level === 'warning'" />
            <InfoCircle v-else-if="level === 'info'" />
        </div>
        <div>
            <h4 class="alert-heading" v-if="heading">{{heading}}</h4>
            <div class="alert-description">
                <slot />
            </div>
        </div>
        <a v-if="dismissable" class="btn-close" data-bs-dismiss="alert" aria-label="close" @click="$emit('dismiss')"></a>
    </div>
    `
}