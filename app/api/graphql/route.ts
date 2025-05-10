// app/api/graphql/route.ts
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { resolvers } from '@/graphql/resolvers';
import { typeDefs } from '@/graphql/schema';

const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
        console.error('GraphQL Error:', error);
        return {
            message: error.message,
            code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
        };
    },
});

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
    context: async (req) => {
        return { req };
    },
});

export async function POST(req: NextRequest) {
    try {
        return await handler(req);
    } catch (error) {
        console.error('API Error:', error);
        return new Response(
            JSON.stringify({
                errors: [{
                    message: error instanceof Error ? error.message : 'An unexpected error occurred',
                }],
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}   