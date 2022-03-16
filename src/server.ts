import express from 'express';
import 'reflect-metadata';
import {ApolloServer} from 'apollo-server-express';
import {BookResolver} from './resolvers/book.resolver'
import { buildSchema} from 'type-graphql'
import {AuthorResolver} from './resolvers/author.resolvers'
import { AuthResolver } from './resolvers/auth.resolvers';

export async function startServer(){
  
  const app = express();

  const server = new  ApolloServer({
    schema: await  buildSchema({resolvers: [BookResolver, AuthorResolver, AuthResolver]}),
    context: ({req,res}) => ({req, res})
  });

  await server.start()
  server.applyMiddleware({app, path:'/graphql'})

  return app;

}


