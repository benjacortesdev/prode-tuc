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
  flagSize = 32,
}: TeamWithFlagProps) {
  const { prefix, name } = parseTeamLabel(team);
  const code = getCountryCode(team);

  return (
    <div className={`flex min-w-0 flex-col items-center gap-1 ${className}`}>
      {prefix && (
        <span className="max-w-full truncate text-[0.65rem] leading-tight text-muted-foreground">
          {prefix}
        </span>
      )}
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
          className="flex items-center justify-center rounded-sm bg-muted text-xs text-muted-foreground ring-1 ring-black/10"
          style={{
            width: flagSize,
            height: Math.round(flagSize * 0.75),
          }}
          aria-hidden
        >
          ?
        </span>
      )}
      <span className="max-w-full truncate text-center text-sm font-semibold leading-tight text-foreground md:text-base">
        {name}
      </span>
    </div>
  );
}
