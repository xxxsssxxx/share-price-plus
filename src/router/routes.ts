import { RouterOptions } from "vue-router";

// Layouts
import Default from "@/layouts/Default.vue";

// Pages
import SpMain from "@/pages/SpMain.vue";
import SpUser from "@/pages/SpUser.vue";
import SpEvents from "@/pages/SpEvents.vue";
import SpEvent from "@/pages/SpEvent.vue";
import SpHome from "@/pages/SpHome.vue";

export const routes: RouterOptions["routes"] = [
  {
    path: "/",
    component: Default,
    redirect: "/home",
    children: [
      {
        path: "home",
        name: "Home",
        component: SpHome
      },
      {
        path: "simple-calculations",
        name: "Simple",
        component: SpMain
      },
      {
        path: "user",
        name: "User",
        component: SpUser
      },
      {
        path: "events",
        name: "Events",
        component: SpEvents
      },
      {
        path: "event/:id",
        name: "Event",
        component: SpEvent
      }
    ]
  }
];
