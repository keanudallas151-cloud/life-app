import { LS } from "./storage";

const KEY = "life_resume_topic";

/** @returns {{ key: string, at: number } | null} */
export function getResumeTopic() {
  const v = LS.get(KEY, null);
  if (!v || typeof v.key !== "string") return null;
  return v;
}

export function setResumeTopic(contentKey) {
  LS.set(KEY, { key: contentKey, at: Date.now() });
}

export function clearResumeTopic() {
  LS.del(KEY);
}
