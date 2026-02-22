import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT || 'https://bootflare.com/graphql';

export const client = new GraphQLClient(endpoint, {
  headers: {
    // Add any necessary headers like authorization if required
  },
});

export async function fetchGraphQL<T>(query: string, variables?: Record<string, any>): Promise<T> {
  return await client.request<T>(query, variables);
}
