import type { WorkspaceData } from './domain/types';

declare global {
  interface Window {
    desktop?: {
      load: () => Promise<WorkspaceData | null>;
      save: (data: WorkspaceData) => Promise<boolean>;
      openExternal: (url: string) => Promise<boolean>;
      platform: string;
    };
  }
}
