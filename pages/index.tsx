import { Dispatch, SetStateAction, useState } from "react";
import {
  AllJokesQuery,
  useVoteJokeMutation,
  AllJokesDocument,
} from "../lib/randomJoke.graphql";
import { initializeApollo } from "../lib/apollo";
import { NormalizedCacheObject, useMutation } from "@apollo/client";
import { fetchRandomJoke } from "../helper/random-joke-helper";
import Link from "next/link";
interface RandomJokeProp {
  icon_url: string;
  id: string;
  url: string;
  value: string;
}

interface PageProps {
  randomJoke: RandomJokeProp;
  initialApolloState: NormalizedCacheObject;
}
const JokeImage = ({ iconUrl }: { iconUrl: string }) => {
  return (
    <div className="h-1/6 self-center mb-4">
      <img src={iconUrl} className="shadow-2xl" />
    </div>
  );
};

const JokeContent = ({ content }: { content: string }) => {
  return (
    <div className="h-5/6">
      <p className="text-3xl text-center font-mono">{content}</p>
    </div>
  );
};

const VoteButtons = ({
  jokeId,
  jokeContent,
  setNewJoke,
}: {
  jokeId: string;
  jokeContent: string;
  setNewJoke: Dispatch<SetStateAction<RandomJokeProp>>;
}) => {
  const [voteJokeMutation] = useVoteJokeMutation();
  const onVoteJoke = async (id: string, score: number, content: string) => {
    voteJokeMutation({
      variables: {
        id: id,
        points: score,
        content: content,
      },
      //Follow apollo suggestion to update cache
      //https://www.apollographql.com/docs/angular/features/cache-updates/#update
      update: (cache, mutationResult) => {
        const { data } = mutationResult;
        if (!data) return; // Cancel updating score in cache if no data is returned from mutation.
        // Read the data from our cache for this query.
        const { allJokes } = cache.readQuery({
          query: AllJokesDocument,
        }) as AllJokesQuery;
        let newJoke = allJokes.find(({ id }) => {
          id === id;
        });
        if (newJoke) {
          newJoke.score = data.voteJoke.score;
        } else {
          newJoke = {
            id,
            score,
            content,
          };
        }
        const newAllJokes = [...allJokes, newJoke];
        // Add our comment from the mutation to the end.
        // Write our data back to the cache.
        cache.writeQuery({
          query: AllJokesDocument,
          data: { allJokes: newAllJokes },
        });
      },
    });
    // Fetch another random joke
    setNewJoke(null);
    const newRandomJoke = await fetchRandomJoke();
    setNewJoke(newRandomJoke);
  };
  return (
    <div className="flex justify-around mt-8">
      <button
        onClick={() => onVoteJoke(jokeId, 1, jokeContent)}
        className="bg-green-500 text-slate-900 border-2 border-indigo-900 rounded p-2 shadow-xl"
      >
        LOL
      </button>
      <button
        onClick={() => onVoteJoke(jokeId, 0, jokeContent)}
        className="bg-yellow-500 text-slate-900 border-2 border-indigo-900 rounded p-2 shadow-xl"
      >
        Hmmm...
      </button>
      <button
        onClick={() => onVoteJoke(jokeId, -1, jokeContent)}
        className="bg-red-500 text-slate-900 border-2 border-indigo-900 rounded p-2 shadow-xl"
      >
        Lame!
      </button>
    </div>
  );
};

const Index: React.FC<PageProps> = (props) => {
  // const { allJokes } = useAllJokesQuery().randomJoke!;
  const [newJoke, setNewJoke] = useState<RandomJokeProp>(props.randomJoke);

  return (
    <div className="flex flex-col justify-center items-center bg-indigo-400 w-screen h-screen">
      <div className="max-w-md bg-indigo-600 border-4 border-indigo-900 p-8 rounded-lg shadow-2xl">
        {newJoke ? (
          <div className="flex flex-col">
            <div className="flex flex-col bg-indigo-500 rounded p-4">
              <JokeImage iconUrl={newJoke.icon_url} />
              <JokeContent content={newJoke.value} />
            </div>
            <VoteButtons
              jokeId={newJoke.id}
              jokeContent={newJoke.value}
              setNewJoke={setNewJoke}
            />
          </div>
        ) : (
          <div className="w-md bg-indigo-600 border-4 border-indigo-900 rounded-lg shadow-2xl">
            <img src="/assets/spinner.gif" alt="loading" />
          </div>
        )}
      </div>
      <div className="text-xl text-center font-mono bg-fuchsia-200 mt-8 border-8 rounded p-4 border-fuchsia-300">
        <span className="text-fuchsia-900"><Link href={"/results"}>Check Results</Link></span>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: AllJokesDocument,
  });

  const randomJoke = await fetchRandomJoke();

  if (!randomJoke) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      randomJoke,
    },
  };
}

export default Index;
