import { Joke } from './../__generated__/__types__';
import { prisma } from './prisma';

import { MutationResolvers, QueryResolvers } from '../__generated__/__types__'
import { ResolverContext } from './apollo'


const Query: Required<QueryResolvers<ResolverContext, Joke>> = {
  async allJokes(_parent, _args, _context, _info) {
    const jokes = await prisma.joke.findMany({})
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
