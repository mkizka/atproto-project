import { AtpBaseClient } from "lexicon/api";

const client = new AtpBaseClient();
const agent = client.service("http://localhost:3000");

function App() {
  return (
    <button
      onClick={() => {
        agent.dev.mkizka.sample
          .sampleMethod({
            actor: "mkizka.dev",
          })
          .then(console.log)
          .catch(console.error);
      }}
    >
      button
    </button>
  );
}

export default App;
