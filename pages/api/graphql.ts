import { ApolloServer } from 'apollo-server-micro'
import { schema } from '../../lib/schema'

const apolloServer = new ApolloServer({ schema, 
  // context: global.prisma
 })

export const config = {
  api: {
    bodyParser: false,
  },
}

export default apolloServer.createHandler({ path: '/api/graphql' })
