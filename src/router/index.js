import { createRouter, createWebHashHistory } from "vue-router";
import FightForm from "../components/FightForm.vue";

const routes = [{ path: "/", name: "home", component: FightForm }];

export default createRouter({
  // Hash history keeps it working when opened from a static file / preview.
  history: createWebHashHistory(),
  routes,
});
