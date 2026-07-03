import { app } from "./app";
import { env } from "./env";

app.listen(env.port, () => {
  console.log(`TadjPharm API demarree sur http://localhost:${env.port}`);
});
