import { createContext, useContext } from "react";
import type { ResolvedHeader } from "../../core/utils/page/resolve-page-config";

type SetHeader = (header: ResolvedHeader | null) => void;

const HeaderContext = createContext<SetHeader>(() => {});

/** The header lives in the Shell, so it doesn't disappear while a page loads; each page tells it what to show. */
export const HeaderProvider = HeaderContext.Provider;

export function useSetHeader(): SetHeader {
  return useContext(HeaderContext);
}
