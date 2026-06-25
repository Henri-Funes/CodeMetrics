import { theme as antTheme } from 'antd';

export const cartonTheme = {
  algorithm: antTheme.darkAlgorithm,
  token: {
    fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", sans-serif', // Opcional, pero da más el estilo
    colorPrimary: '#24c9da',
    colorSuccess: '#37d39b',
    colorWarning: '#f3c65f',
    colorError: '#ff6f6f',
    colorInfo: '#24c9da',
    colorText: '#f4f7fb',
    colorTextSecondary: '#cfd7e3',
    colorTextTertiary: '#97a4b4',
    
    // Neobrutalism / Carton traits
    borderRadius: 8,
    lineWidth: 2,
    colorBorder: 'rgba(58, 226, 244, 0.34)',
    colorBgBase: '#14171d',
    colorBgContainer: '#21262f',
    colorBgElevated: '#262d37',
    
    boxShadow: '0 16px 34px rgba(4, 10, 18, 0.4)',
    boxShadowSecondary: '4px 4px 0px rgba(36, 201, 218, 0.22)',
  },
  components: {
    Card: {
      colorBorderSecondary: 'rgba(58, 226, 244, 0.58)',
      lineWidth: 2,
      headerBg: '#262d37'
    },
    Button: {
      lineWidth: 2,
      controlHeight: 40,
      fontWeight: 'bold',
    },
    Layout: {
      headerBg: 'transparent',
      siderBg: 'transparent',
      bodyBg: 'transparent',
      footerBg: 'transparent'
    },
    Menu: {
      itemColor: '#cfd7e3',
      itemSelectedColor: '#f4f7fb',
      itemBg: 'transparent',
      itemSelectedBg: 'rgba(36, 201, 218, 0.14)',
      itemHoverBg: 'rgba(36, 201, 218, 0.08)'
    },
    Tag: {
      defaultBg: '#2a313c',
      defaultColor: '#dbe3ed'
    },
    Drawer: {
      colorBgElevated: '#1b2027',
    }
  }
};
