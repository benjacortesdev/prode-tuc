import { Redis } from "@upstash/redis";
import type { ProdeState } from "./types";

const STATE_KEY = "prode:state";

const EMPTY_STATE: ProdeState = {
  users: [],
  matches: [],
  predictions: [],
};

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN deben estar configurados"
    );
  }

  return new Redis({ url, token });
}

export async function getState(): Promise<ProdeState> {
  const redis = getRedis();
  const state = await redis.get<ProdeState>(STATE_KEY);
  return state ?? EMPTY_STATE;
}

export async function setState(state: ProdeState): Promise<void> {
  const redis = getRedis();
  await redis.set(STATE_KEY, state);
}

export async function updateState(
  updater: (state: ProdeState) => void | Promise<void>
): Promise<ProdeState> {
  const state = await getState();
  await updater(state);
  await setState(state);
  return state;
}
