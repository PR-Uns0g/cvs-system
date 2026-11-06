export interface KratosUiMessage {
  id?: number;
  text: string;
  type?: string;
}

export interface KratosUiNode {
  type: string;
  group?: string;
  attributes: {
    name: string;
    type: string;
    value?: string | number;
    required?: boolean;
    disabled?: boolean;
    autocomplete?: string;
    pattern?: string;
    minlength?: number;
    maxlength?: number;
  };
  meta?: {
    label?: {
      text: string;
    };
  };
  messages?: KratosUiMessage[];
}

export interface KratosBrowserFlow {
  ui: {
    action: string;
    method: string;
    nodes: KratosUiNode[];
    messages?: KratosUiMessage[];
  };
}

export interface KratosSession {
  active: boolean;
  identity?: {
    traits?: {
      email?: unknown;
      fullName?: unknown;
    };
  };
}

export interface AuthSessionResponse {
  authenticated: boolean;
  user?: {
    fullName: string | null;
    email: string | null;
  };
}

export interface KratosLogoutFlow {
  logout_url: string;
}

export interface KratosError {
  error?: {
    code?: number;
    status?: string;
    reason?: string;
    message?: string;
  };
  code?: number;
  message?: string;
}
