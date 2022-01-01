import React, { useEffect, useState } from "react";
import { initializeApollo } from "../lib/apollo";
import { AllJokesDocument } from "../lib/randomJoke.graphql";
import { useAllJokesQuery } from "../__generated__/lib/randomJoke.graphql";
import { Joke } from "../__generated__/__types__";
import Link from "next/link";

const LIMIT = 4;

const JokeDetails = ({ joke }: { joke: Joke }) => {
  return (
    <li key={joke.id} className="flex flex-col bg-indigo-500 mb-4 rounded p-2">
      <div className="text-xl text-center font-mono">{joke.content}</div>
      <span className="mt-2 self-center bg-fuchsia-500 p-2 rounded border-4 border-fuchsia-900">
        Popularity: {joke.score}
      </span>
    </li>
  );
};

function ResultsPage() {
  const [variables, setVariables] = useState({
    offset: 0,
    limit: LIMIT,
  });
  const [jokes, setJokes] = useState([])

  const { data, refetch, loading, error } = useAllJokesQuery({
    variables,
  });

  useEffect(() => {
    refetch(variables).then(({data}) => {
        setJokes((prevJokes) => [...prevJokes, ...data.allJokes]);
    }).catch((error) => {
        console.log("Error showing more ", error)
    });
  }, [variables]);

  if (loading) {
    return <div>Loading</div>;
  }

  if (error) {
    return <div>Error</div>;
  }

  if (jokes) {
    return (
      <div className="flex flex-col items-center bg-indigo-400 w-screen h-screen overflow-auto">
        <div className="p-8 text-2xl italic">Popular Jokes List</div>
        <div className="max-w-xl bg-indigo-600 border-4 border-indigo-900 p-8 rounded-lg shadow-2xl">
          <ul className="flex flex-col">
            {jokes.map((joke) => {
              return <JokeDetails key={joke.id} joke={joke} />;
            })}
          </ul>
        </div>
        <div className="p-8">
          <button
            className=""
            onClick={() =>
              setVariables((prev) => {
                return { ...prev, offset: prev.offset + LIMIT };
              })
            }
          >
            Show more
          </button>
        </div>
        <div className="text-xl text-center font-mono bg-fuchsia-200 border-8 rounded p-4 border-fuchsia-300">
          <span className="text-fuchsia-900">
            <Link href={"/"}>Back to Voting</Link>
          </span>
        </div>
        <div className="p-8" />
      </div>
    );
  }
}

export default ResultsPage;

export async function getStaticProps() {
  const apolloClient = initializeApollo();
  await apolloClient.query({
    query: AllJokesDocument,
    variables: {
      offset: 0,
      limit: LIMIT,
    },
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
  };
}
