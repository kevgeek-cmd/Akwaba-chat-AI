export type MascotState =
  | "idle"
  | "walking"
  | "running"
  | "searching"
  | "success"
  | "error";

export type MascotErrorCode =
  | "NETWORK_ERROR"
  | "SEARCH_FAILED"
  | "TIMEOUT"
  | "PROVIDER_ERROR"
  | "NO_RESULT"
  | "UNKNOWN_ERROR";

export interface MascotProgressEvent {
  type: "progress";
  state: MascotState;
  progress: number;
  message?: string;
  errorCode?: MascotErrorCode | string;
}

export interface MascotContextValue {
  state: MascotState;
  progress: number;
  message: string;
  errorCode?: string;
  isCompleted: boolean;
  isError: boolean;
}
