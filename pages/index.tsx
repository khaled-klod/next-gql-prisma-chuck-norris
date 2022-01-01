import Link from "next/link";
import { useState } from "react";
import {
  AllJokesQuery,
  useAllJokesQuery,
  useVoteJokeMutation,
  AllJokesDocument,
} from "../lib/randomJoke.graphql";
import { initializeApollo } from "../lib/apollo";

const Index = (props) => {
  // const { allJokes } = useAllJokesQuery().data!;
  const [newJoke, setNewJoke] = useState(props.data);
  console.log(`newJoke`, newJoke);

  // const [updateNameMutation] = useUpdateNameMutation()

  const onVoteJoke = (id, score, content) => {
    useVoteJokeMutation({
      variables: {
        id: id,
        points: score,
        content: content
      },
      //Follow apollo suggestion to update cache
      //https://www.apollographql.com/docs/angular/features/cache-updates/#update
      update: (cache, mutationResult) => {
        const { data } = mutationResult;
        if (!data) return; // Cancel updating name in cache if no data is returned from mutation.
        // Read the data from our cache for this query.
        const { allJokes } = cache.readQuery({
          query: AllJokesDocument,
        }) as AllJokesQuery;
        const newJoke = allJokes.find(({ id }) => {
          id === id;
        });
        newJoke.score = data.voteJoke.score;
        const newAllJokes = { ...allJokes, newJoke };
        // Add our comment from the mutation to the end.
        // Write our data back to the cache.
        cache.writeQuery({
          query: AllJokesDocument,
          data: { viewer: newAllJokes },
        });
      },
    });
    // Fetch another random joke
  };

  return (
    <div className="flex flex-col justify-center items-center bg-indigo-400 w-screen h-screen">
      <div className="max-w-md bg-indigo-600 border-4 border-indigo-900 p-8 rounded-lg shadow-2xl">
        <div className="flex flex-col">
          <div className="flex flex-col bg-indigo-500 rounded p-4">
            <div className="h-1/6 self-center mb-4">
              <img src={newJoke.icon_url} className="shadow-2xl" />
            </div>
            <div className="h-5/6">
              <p className="text-3xl text-center font-mono">{newJoke.value}</p>
            </div>
          </div>

          <div className="flex justify-around mt-8">
            <button
              onClick={() => onVoteJoke(newJoke.id, 1, newJoke.value)}
              className="bg-green-500 text-slate-900 border-2 border-indigo-900 rounded p-2 shadow-xl"
            >
              LOL
            </button>
            <button
              onClick={() => onVoteJoke(newJoke.id, 0, newJoke.value)}
              className="bg-yellow-500 text-slate-900 border-2 border-indigo-900 rounded p-2 shadow-xl"
            >
              Hmmm...
            </button>
            <button
              onClick={() => onVoteJoke(newJoke.id, -1, newJoke.value)}
              className="bg-red-500 text-slate-900 border-2 border-indigo-900 rounded p-2 shadow-xl"
            >
              Lame!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: AllJokesDocument,
  });

  const res = await fetch(`https://api.chucknorris.io/jokes/random`);
  const data = await res.json();
  console.log(`data`, data);

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      data,
    },
  };
}

export default Index;
