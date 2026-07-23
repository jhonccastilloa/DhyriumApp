import { palette } from './palette';

type SemanticColors = {
  surface: {
    background: {
      primary: string;
      cards: string;
      elements: string;
      submenu: string;
    };
    gradient: {
      background1: string;
      background2: string;
    };
  };
  text: {
    headings: string;
    body: string;
    details: string;
    button: string;
    link: string;
    disabled: string;
    success: string;
    error: string;
    warning: string;
  };
  icon: {
    primary: string;
    secondary: string;
    button: string;
    disabled: string;
  };
  button: {
    fill: {
      primary: string;
      secondary: string;
      disabled: string;
      base: string;
    };
    action: {
      surface: string;
    };
    border: string;
  };
  graphics: {
    default: string;
    text: string;
  };
};

export const lightColors = {
  surface: {
    background: {
      primary: palette.blue[100],
      cards: palette.pure.white,
      elements: palette.blue[200],
      submenu: 'rgba(230, 234, 239, 0.5)',
    },
    gradient: {
      background1: palette.pure.white,
      background2: palette.blue[200],
    },
  },
  text: {
    headings: palette.blue[900],
    body: palette.blue[500],
    details: palette.blue[400],
    button: palette.pure.white,
    link: palette.green[700],
    disabled: palette.blue[400],
    success: palette.pure.white,
    error: palette.pure.white,
    warning: palette.pure.white,
  },
  icon: {
    primary: palette.blue[800],
    secondary: palette.blue[500],
    button: palette.pure.white,
    disabled: palette.blue[400],
  },
  button: {
    fill: {
      primary: palette.brand.blue,
      secondary: palette.blue[200],
      disabled: palette.blue[200],
      base: palette.blue[300],
    },
    action: {
      surface: palette.pure.white,
    },
    border: palette.blue[300],
  },
  graphics: {
    default: palette.green[600],
    text: palette.green[700],
  },
} as const satisfies SemanticColors;

export const darkColors = {
  surface: {
    background: {
      primary: palette.blue[900],
      cards: palette.blue[800],
      elements: palette.blue[600],
      submenu: 'rgba(19, 30, 41, 0.5)',
    },
    gradient: {
      background1: palette.blue[600],
      background2: palette.blue[700],
    },
  },
  text: {
    headings: palette.pure.white,
    body: palette.blue[300],
    details: palette.blue[400],
    button: palette.blue[900],
    link: palette.brand.green,
    disabled: palette.blue[500],
    success: palette.pure.white,
    error: palette.pure.white,
    warning: palette.pure.white,
  },
  icon: {
    primary: palette.pure.white,
    secondary: palette.blue[300],
    button: palette.blue[900],
    disabled: palette.blue[400],
  },
  button: {
    fill: {
      primary: palette.brand.green,
      secondary: palette.blue[600],
      disabled: palette.blue[800],
      base: palette.blue[600],
    },
    action: {
      surface: palette.blue[600],
    },
    border: palette.blue[500],
  },
  graphics: {
    default: palette.green[600],
    text: palette.brand.green,
  },
} as const satisfies SemanticColors;

export type IconColorTheme = keyof SemanticColors['icon'];
export type TextColorTheme = keyof SemanticColors['text'];
