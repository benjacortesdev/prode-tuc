import { config } from "dotenv";

config({ path: ".env.local" });

import { getState, setState } from "../lib/db";
import { scoreMatch } from "../lib/scoring";
import { importWorldCup2026Matches } from "../lib/worldcup";

async function main() {
  const force = process.argv.includes("--force");
  const state = await getState();

  if (state.matches.length > 0 && !force) {
    console.log(
      `Ya hay ${state.matches.length} partidos. Usa --force para reemplazar.`
    );
    process.exit(1);
  }

  const { matches, withResults, source } = await importWorldCup2026Matches();

  if (force) {
    state.predictions = [];
    for (const user of state.users) {
      user.totalPoints = 0;
      user.exactScores = 0;
    }
  }

  state.matches = matches;

  for (const match of matches) {
    if (
      match.scored &&
      match.homeScore !== undefined &&
      match.awayScore !== undefined
    ) {
      scoreMatch(state, match.id, match.homeScore, match.awayScore);
    }
  }

  await setState(state);

  console.log(
    `✓ Importados ${matches.length} partidos (${withResults} con resultado)`
  );
  console.log(`  Fuente: ${source}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
