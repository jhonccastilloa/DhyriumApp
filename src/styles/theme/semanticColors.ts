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
    status: {
      success: string;
      warning: string;
      info: string;
      error: string;
      review: string;
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
      primary: palette.navy[50],
      cards: palette.pure.white,
      elements: palette.navy[100],
      submenu: palette.cyan[50],
    },
    gradient: {
      background1: palette.pure.white,
      background2: palette.cyan[100],
    },
    status: {
      success: palette.green[50],
      warning: palette.amber[50],
      info: palette.info[50],
      error: palette.red[50],
      review: palette.navy[50],
    },
  },
  text: {
    headings: palette.brand.secondary,
    body: palette.navy[500],
    details: palette.navy[400],
    button: palette.pure.white,
    link: palette.cyan[700],
    disabled: palette.navy[400],
    success: palette.green[700],
    error: palette.red[500],
    warning: palette.amber[600],
  },
  icon: {
    primary: palette.brand.secondary,
    secondary: palette.navy[500],
    button: palette.pure.white,
    disabled: palette.navy[400],
  },
  button: {
    fill: {
      primary: palette.brand.primary,
      secondary: palette.navy[100],
      disabled: palette.navy[100],
      base: palette.cyan[600],
    },
    action: {
      surface: palette.pure.white,
    },
    border: palette.neutral[100],
  },
  graphics: {
    default: palette.brand.primary,
    text: palette.cyan[700],
  },
} as const satisfies SemanticColors;

export const darkColors = {
  surface: {
    background: {
      primary: palette.navy[900],
      cards: palette.navy[800],
      elements: palette.navy[700],
      submenu: palette.navy[700],
    },
    gradient: {
      background1: palette.navy[800],
      background2: palette.navy[900],
    },
    status: {
      success: palette.green.alpha[16],
      warning: palette.amber.alpha[18],
      info: palette.info.alpha[16],
      error: palette.red.alpha[16],
      review: palette.navy.alpha[16],
    },
  },
  text: {
    headings: palette.navy[50],
    body: palette.cyan[100],
    details: palette.navy[300],
    button: palette.navy[900],
    link: palette.cyan[400],
    disabled: palette.navy[400],
    success: palette.green[400],
    error: palette.red[400],
    warning: palette.amber[400],
  },
  icon: {
    primary: palette.navy[50],
    secondary: palette.cyan[100],
    button: palette.navy[900],
    disabled: palette.navy[400],
  },
  button: {
    fill: {
      primary: palette.cyan[400],
      secondary: palette.navy[700],
      disabled: palette.navy[700],
      base: palette.navy[600],
    },
    action: {
      surface: palette.navy[600],
    },
    border: palette.cyan.alpha[24],
  },
  graphics: {
    default: palette.cyan[400],
    text: palette.cyan[100],
  },
} as const satisfies SemanticColors;

export type IconColorTheme = keyof SemanticColors['icon'];
export type TextColorTheme = keyof SemanticColors['text'];
