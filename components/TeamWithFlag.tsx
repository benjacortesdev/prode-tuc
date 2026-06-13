import Image from "next/image";
import { getCountryCode, getFlagUrl, parseTeamLabel } from "@/lib/team-flags";

interface TeamWithFlagProps {
  team: string;
  className?: string;
  flagSize?: number;
}

export default function TeamWithFlag({
  team,
  className = "",
  flagSize = 28,
}: TeamWithFlagProps) {
  const { prefix, name } = parseTeamLabel(team);
  const code = getCountryCode(team);

  return (
    <div className={`flex flex-col items-center gap-0.5 ${className}`}>
      {prefix && (
        <span className="text-xs text-gray-500 leading-tight">{prefix}</span>
      )}
      <div className="flex items-center justify-center gap-2">
        {code ? (
          <Image
            src={getFlagUrl(code, flagSize)}
            width={flagSize}
            height={Math.round(flagSize * 0.75)}
            alt=""
            className="rounded-sm shadow-sm ring-1 ring-black/10"
            unoptimized
          />
        ) : (
          <span
            className="flex items-center justify-center rounded-sm bg-gray-100 text-xs text-gray-400 ring-1 ring-black/10"
            style={{
              width: flagSize,
              height: Math.round(flagSize * 0.75),
            }}
            aria-hidden
          >
            ?
          </span>
        )}
        <span className="font-semibold text-foreground text-center leading-tight">
          {name}
        </span>
      </div>
    </div>
  );
}
