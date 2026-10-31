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
}

export interface KratosLogoutFlow {
  logout_url: string;
}
