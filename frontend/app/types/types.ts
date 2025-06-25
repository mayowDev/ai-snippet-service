// Types and interfaces moved from _index.tsx

export interface Snippet {
  id: string;
  text: string;
  summary: string;
  createdAt: string;
  createdBy?: string;
}

export interface ActionData {
  error?: string;
  fieldErrors?: {
    text?: string;
    email?: string;
  };
} 