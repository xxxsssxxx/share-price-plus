// store.ts
import { ISpEvent, ISpEventUpload } from "@/types/entities/event";
import { ISpUser } from "@/types/entities/user";
import { InjectionKey } from "vue";
import { createStore, useStore as baseUseStore, Store } from "vuex";
import { apolloClient } from "@/services/apollo";

// Queries
import { EVENTS_QUERY } from "@/gql/queries/spEvents";
import { CURRENT_USER } from "@/gql/queries/spCurrentUser";
import { UPDATE_EVENT } from "@/gql/mutations/updateEvent";
import { getUsers } from "@/services/queries";
import { router } from "@/router/router";

export interface State {
  currentUser: ISpUser | null;
  spEvents: ISpEvent[] | null;
  currentEvent: ISpEvent | null;
}

interface CurrentUserResponse {
  data?: {
    currentUser: ISpUser;
  };
  errors?: { message: string }[];
}

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
  state: {
    currentUser: null,
    spEvents: null,
    currentEvent: null
  },
  mutations: {
    setCurrentUser(state: State, user: ISpUser | null) {
      state.currentUser = user;
    },
    setEvents(state: State, events: ISpEvent[] | null) {
      state.spEvents = events;
    },
    setCurrentEvent(state: State, event: ISpEvent | null) {
      state.currentEvent = event;
    }
  },
  actions: {
    async getCurrentUser({ commit }): Promise<void> {
      // Well apparantly apollo.query return just data obj in typescript and no error ??
      const response: any = await apolloClient.query<CurrentUserResponse>({
        query: CURRENT_USER
      });

      const { data, errors } = response;

      if (errors?.[0].message.includes("Auth")) {
        commit("setCurrentUser", null);
        router.push("/signin");
        return;
      }

      commit("setCurrentUser", data?.currentUser);
    },
    async getCurrentEvent({ commit }, id: ISpEvent["_id"]): Promise<void> {
      if (!id) return;

      const {
        data: { spEvents }
      }: { data: { spEvents: ISpEvent[] } } = await apolloClient.query({
        query: EVENTS_QUERY,
        variables: { idIn: [id] }
      });

      commit("setCurrentEvent", spEvents[0]);
    },
    async getEvents({ commit }, eventsIds: ISpEvent["_id"][]): Promise<void> {
      const {
        data: { spEvents }
      }: { data: { spEvents: ISpEvent[] } } = await apolloClient.query({
        query: EVENTS_QUERY,
        variables: {
          idIn: eventsIds
        }
      });
      commit("setEvents", spEvents);
    },
    async getUserEventsIds({ state, commit }, id: ISpUser["_id"]): Promise<void> {
      if (!id) return;
      const users = await getUsers();

      if (id === state.currentUser?._id) {
        commit("setCurrentUser", { ...state.currentUser, events: users[0].events });
      }
    },
    async updateEvent({ commit }, { data, current = false }: { data: ISpEventUpload; current: boolean }) {
      const result: { data?: { updateEvent: ISpEvent } | null | undefined } = await apolloClient.mutate({
        mutation: UPDATE_EVENT,
        variables: data
      });

      if (current) {
        commit("setCurrentEvent", result?.data?.updateEvent);
      }
    }
  }
});

// define your own `useStore` composition function
export function useStore() {
  return baseUseStore(key);
}
