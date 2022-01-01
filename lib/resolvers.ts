import { Joke } from './../__generated__/__types__';
import { prisma } from './prisma';

import { MutationResolvers, QueryResolvers } from '../__generated__/__types__'
import { ResolverContext } from './apollo'

const LIMIT = 4;

const Query: Required<QueryResolvers<ResolverContext, Joke>> = {
  async allJokes(_parent, _args, _context, _info) {
    const {offset = 0, limit = LIMIT} = _args;
    const jokes = await prisma.joke.findMany({
      orderBy: {
        score: 'desc',
      },
      skip: offset,
      take: limit
    });
    return jokes
  },
}

const Mutation: Required<MutationResolvers<ResolverContext>> = {
  async voteJoke(_parent, _args, _context, _info) {
    const {id, points, content} = _args
    const joke = await prisma.joke.upsert({
      where: {
        id: id
      }, 
      update: {
        score: {
          increment: points
        }
      },
      create : {
        id,
        score: points,
        content: content
      }
    })
    return joke
  },
}

export default { Query, Mutation }
