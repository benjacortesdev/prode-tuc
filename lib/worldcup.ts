import type { Match } from "./types";

const OPENFOOTBALL_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

const THESTATSAPI_FIXTURES_URL =
  "https://www.thestatsapi.com/world-cup/data/fixtures.json";

const WORLDCUP26_API_GAMES = "https://worldcup26.ir/get/games";

export const WORLD_CUP_API_SOURCES = {
  openfootball: {
    name: "Open Football (worldcup.json)",
    url: OPENFOOTBALL_URL,
    description: "JSON público sin API key. Incluye fixture y resultados.",
    license: "Public domain",
  },
  thestatsapi: {
    name: "TheStatsAPI",
    url: THESTATSAPI_FIXTURES_URL,
    description: "104 fixtures con kickoff UTC. Sin API key.",
    license: "Free with attribution",
  },
  worldcup26: {
    name: "World Cup 2026 API (worldcup26.ir)",
    url: WORLDCUP26_API_GAMES,
    description: "REST API con live scores y 104 partidos.",
    license: "Open source (ISC)",
  },
} as const;

const TEAM_NAMES_ES: Record<string, string> = {
  Mexico: "México",
  "South Africa": "Sudáfrica",
  "South Korea": "Corea del Sur",
  "Czech Republic": "Rep. Checa",
  Czechia: "Rep. Checa",
  "Korea Republic": "Corea del Sur",
  Canada: "Canadá",
  "Bosnia & Herzegovina": "Bosnia",
  "Bosnia and Herzegovina": "Bosnia",
  Qatar: "Catar",
  Switzerland: "Suiza",
  Brazil: "Brasil",
  Morocco: "Marruecos",
  Haiti: "Haití",
  Scotland: "Escocia",
  USA: "Estados Unidos",
  "United States": "Estados Unidos",
  Paraguay: "Paraguay",
  Australia: "Australia",
  Turkey: "Turquía",
  Germany: "Alemania",
  "Curaçao": "Curazao",
  "Ivory Coast": "Costa de Marfil",
  Ecuador: "Ecuador",
  Netherlands: "Países Bajos",
  Japan: "Japón",
  Sweden: "Suecia",
  Tunisia: "Túnez",
  Belgium: "Bélgica",
  Egypt: "Egipto",
  Iran: "Irán",
  "New Zealand": "Nueva Zelanda",
  Spain: "España",
  "Cape Verde": "Cabo Verde",
  "Saudi Arabia": "Arabia Saudita",
  Uruguay: "Uruguay",
  France: "Francia",
  Senegal: "Senegal",
  Iraq: "Irak",
  Norway: "Noruega",
  Argentina: "Argentina",
  Algeria: "Argelia",
  Austria: "Austria",
  Jordan: "Jordania",
  Portugal: "Portugal",
  "DR Congo": "RD Congo",
  Uzbekistan: "Uzbekistán",
  Colombia: "Colombia",
  England: "Inglaterra",
  Croatia: "Croacia",
  Ghana: "Ghana",
  Panama: "Panamá",
};

interface OpenFootballMatch {
  round?: string;
  num?: number;
  date: string;
  time: string;
  team1: string;
  team2: string;
  score?: { ft?: [number, number] };
  group?: string;
  ground?: string;
}

interface OpenFootballData {
  name: string;
  matches: OpenFootballMatch[];
}

function translateTeam(name: string): string {
  if (TEAM_NAMES_ES[name]) return TEAM_NAMES_ES[name];

  if (/^\d[A-L]$/.test(name)) {
    return `${name.charAt(0)}º Grupo ${name.slice(1)}`;
  }
  if (/^1[A-L]$/.test(name)) {
    return `1º Grupo ${name.slice(1)}`;
  }
  if (/^2[A-L]$/.test(name)) {
    return `2º Grupo ${name.slice(1)}`;
  }
  if (/^3[A-L/]+$/.test(name)) {
    return `3º ${name}`;
  }
  if (/^W\d+$/.test(name)) {
    return `Ganador P${name.slice(1)}`;
  }
  if (/^L\d+$/.test(name)) {
    return `Perdedor P${name.slice(1)}`;
  }

  return name;
}

function parseOpenFootballTime(date: string, time: string): string {
  const match = time.match(/^(\d{2}):(\d{2})\s+UTC([+-]\d+)$/);
  if (!match) {
    return new Date(`${date}T12:00:00Z`).toISOString();
  }

  const [, hours, minutes, offsetStr] = match;
  const offsetHours = parseInt(offsetStr, 10);
  const sign = offsetHours >= 0 ? "+" : "-";
  const absOffset = String(Math.abs(offsetHours)).padStart(2, "0");

  return new Date(
    `${date}T${hours}:${minutes}:00${sign}${absOffset}:00`
  ).toISOString();
}

function roundLabel(round?: string, num?: number): string {
  if (num) return `P${num}`;
  if (!round) return "";
  const labels: Record<string, string> = {
    "Matchday 1": "J1",
    "Matchday 2": "J2",
    "Matchday 3": "J3",
    "Matchday 4": "J4",
    "Matchday 5": "J5",
    "Matchday 6": "J6",
    "Matchday 7": "J7",
    "Matchday 8": "J8",
    "Matchday 9": "J9",
    "Matchday 10": "J10",
    "Matchday 11": "J11",
    "Matchday 12": "J12",
    "Matchday 13": "J13",
    "Matchday 14": "J14",
    "Matchday 15": "J15",
    "Matchday 16": "J16",
    "Matchday 17": "J17",
    "Round of 32": "16avos",
    "Round of 16": "8vos",
    "Quarter-final": "4tos",
    "Semi-final": "Semi",
    "Match for third place": "3er puesto",
    Final: "Final",
  };
  return labels[round] ?? round;
}

export function openFootballToMatches(data: OpenFootballData): Match[] {
  return data.matches.map((m) => {
    const homeTeam = translateTeam(m.team1);
    const awayTeam = translateTeam(m.team2);
    const label = roundLabel(m.round, m.num);
    const group = m.group?.replace("Group ", "Grupo ") ?? "";
    const prefix = [label, group].filter(Boolean).join(" · ");

    const match: Match = {
      id: m.num ? `wc2026-${m.num}` : `wc2026-${m.date}-${homeTeam}-${awayTeam}`,
      homeTeam: prefix ? `[${prefix}] ${homeTeam}` : homeTeam,
      awayTeam,
      startTime: parseOpenFootballTime(m.date, m.time),
      scored: false,
    };

    if (m.score?.ft && m.score.ft.length === 2) {
      match.homeScore = m.score.ft[0];
      match.awayScore = m.score.ft[1];
      match.scored = true;
    }

    return match;
  });
}

export async function fetchOpenFootballWorldCup2026(): Promise<OpenFootballData> {
  const res = await fetch(OPENFOOTBALL_URL);
  if (!res.ok) {
    throw new Error(`Open Football API error: ${res.status}`);
  }
  return res.json() as Promise<OpenFootballData>;
}

export async function importWorldCup2026Matches(): Promise<{
  matches: Match[];
  source: string;
  withResults: number;
}> {
  const data = await fetchOpenFootballWorldCup2026();
  const matches = openFootballToMatches(data);
  const withResults = matches.filter((m) => m.scored).length;

  return {
    matches,
    source: OPENFOOTBALL_URL,
    withResults,
  };
}
