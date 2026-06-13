const TEAM_TO_COUNTRY_CODE: Record<string, string> = {
  México: "mx",
  Mexico: "mx",
  Sudáfrica: "za",
  "South Africa": "za",
  "Corea del Sur": "kr",
  "South Korea": "kr",
  "Korea Republic": "kr",
  "Rep. Checa": "cz",
  "Czech Republic": "cz",
  Czechia: "cz",
  Canadá: "ca",
  Canada: "ca",
  Bosnia: "ba",
  "Bosnia & Herzegovina": "ba",
  "Bosnia and Herzegovina": "ba",
  Catar: "qa",
  Qatar: "qa",
  Suiza: "ch",
  Switzerland: "ch",
  Brasil: "br",
  Brazil: "br",
  Marruecos: "ma",
  Morocco: "ma",
  Haití: "ht",
  Haiti: "ht",
  Escocia: "gb-sct",
  Scotland: "gb-sct",
  "Estados Unidos": "us",
  USA: "us",
  "United States": "us",
  Paraguay: "py",
  Australia: "au",
  Turquía: "tr",
  Turkey: "tr",
  Alemania: "de",
  Germany: "de",
  Curazao: "cw",
  "Curaçao": "cw",
  "Costa de Marfil": "ci",
  "Ivory Coast": "ci",
  Ecuador: "ec",
  "Países Bajos": "nl",
  Netherlands: "nl",
  Japón: "jp",
  Japan: "jp",
  Suecia: "se",
  Sweden: "se",
  Túnez: "tn",
  Tunisia: "tn",
  Bélgica: "be",
  Belgium: "be",
  Egipto: "eg",
  Egypt: "eg",
  Irán: "ir",
  Iran: "ir",
  "Nueva Zelanda": "nz",
  "New Zealand": "nz",
  España: "es",
  Spain: "es",
  "Cabo Verde": "cv",
  "Cape Verde": "cv",
  "Arabia Saudita": "sa",
  "Saudi Arabia": "sa",
  Uruguay: "uy",
  Francia: "fr",
  France: "fr",
  Senegal: "sn",
  Irak: "iq",
  Iraq: "iq",
  Noruega: "no",
  Norway: "no",
  Argentina: "ar",
  Argelia: "dz",
  Algeria: "dz",
  Austria: "at",
  Jordania: "jo",
  Jordan: "jo",
  Portugal: "pt",
  "RD Congo": "cd",
  "DR Congo": "cd",
  Uzbekistán: "uz",
  Uzbekistan: "uz",
  Colombia: "co",
  Inglaterra: "gb-eng",
  England: "gb-eng",
  Croacia: "hr",
  Croatia: "hr",
  Ghana: "gh",
  Panamá: "pa",
  Panama: "pa",
};

export function parseTeamLabel(team: string): { prefix?: string; name: string } {
  const match = team.match(/^\[(.+?)\]\s*(.+)$/);
  if (match) {
    return { prefix: match[1], name: match[2].trim() };
  }
  return { name: team.trim() };
}

export function getCountryCode(teamName: string): string | null {
  const { name } = parseTeamLabel(teamName);

  if (
    /^(Ganador|Perdedor|\dº|3º)/i.test(name) ||
    name.includes("Grupo")
  ) {
    return null;
  }

  if (TEAM_TO_COUNTRY_CODE[name]) {
    return TEAM_TO_COUNTRY_CODE[name];
  }

  const lower = name.toLowerCase();
  for (const [key, code] of Object.entries(TEAM_TO_COUNTRY_CODE)) {
    if (key.toLowerCase() === lower) {
      return code;
    }
  }

  return null;
}

export function getFlagUrl(code: string, size = 24): string {
  const height = Math.round(size * 0.75);
  return `https://flagcdn.com/${size}x${height}/${code}.png`;
}
