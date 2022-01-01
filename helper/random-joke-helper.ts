const endpoint = `https://api.chucknorris.io/jokes/random`;

export async function fetchRandomJoke() {
  const res = await fetch(endpoint);
  const data = await res.json();
  return data;
}
