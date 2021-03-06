import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client/core";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
const IS_PROD = process.env.NODE_ENV === "production";
const httpLink = new HttpLink({
  // You should use an absolute URL here
  uri: IS_PROD ? "http://backend.shareprice.online/graphql" : "http://localhost:4000/graphql",
  credentials: "include"
});

// Create the subscription websocket link
const wsLink = new WebSocketLink({
  // You should use an absolute URL here
  uri: IS_PROD ? "ws://backend.shareprice.online/graphql" : "ws://localhost:4000/graphql",
  options: {
    reconnect: true
  }
});

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === "OperationDefinition" && definition.operation === "subscription";
  },
  wsLink,
  httpLink
);

// Create the apollo client
export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache({ addTypename: false }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "no-cache",
      errorPolicy: "ignore"
    },
    query: {
      fetchPolicy: "no-cache",
      errorPolicy: "all"
    }
  },
  connectToDevTools: true,
  credentials: "include"
});
