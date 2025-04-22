import AddItem from "../pages/AddItem.mjs";
import ItemList from "../pages/ItemList.mjs"

export default {
    props: ['showNav'],
    inject: ['router'],
    computed: {
        routes() {
           return [
                {
                  title: "Items",
                  spec: this.router.getSpec(ItemList).spec,
                  path: this.router.getPath(ItemList),
                },
                {
                  title: "New Item",
                  spec: this.router.getSpec(AddItem).spec,
                  path: this.router.getPath(AddItem),
                },
            ];
        }
    },
    template: `
    <header class="navbar navbar-expand-md navbar-light d-print-none">
        <div class="container-xl">
            <h1 class="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
                Heritage archive editor
            </h1>
        </div>
    </header>
    <div class="navbar-expand-md" v-if="showNav !== false">
        <div class="collapse navbar-collapse" id="navbar-menu">
          <div class="navbar navbar-light">
            <div class="container-xl">
              <ul class="navbar-nav">
                <li v-for="(route, index) in routes" :key="index"
                class="nav-item" :class="{ active: router.state.activeSpec === route.spec }">
                    <a class="nav-link" :href="route.path">
                        <span class="nav-link-title">
                        {{route.title}}
                        </span>
                    </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>`,
}