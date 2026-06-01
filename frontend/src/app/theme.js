import { theme as antTheme } from 'antd';

export const cartonTheme = {
  algorithm: antTheme.darkAlgorithm,
  token: {
    fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", sans-serif', // Opcional, pero da más el estilo
    colorPrimary: '#00e5ff',
    colorSuccess: '#00ff88',
    colorWarning: '#ffcc00',
    colorError: '#ff4444',
    colorInfo: '#00e5ff',
    
    // Neobrutalism / Carton traits
    borderRadius: 8,
    lineWidth: 2,
    colorBorder: '#444444', // Bordes grises oscuros
    colorBgBase: '#121212',
    colorBgContainer: '#1e1e1e',
    colorBgElevated: '#2a2a2a',
    
    boxShadow: '4px 4px 0px rgba(0, 229, 255, 0.3)',
    boxShadowSecondary: '4px 4px 0px rgba(255, 255, 255, 0.1)',
  },
  components: {
    Card: {
      colorBorderSecondary: '#00e5ff', // Bordes cyan para tarjetas
      lineWidth: 2,
    },
    Button: {
      lineWidth: 2,
      controlHeight: 40,
      fontWeight: 'bold',
    },
    Drawer: {
      colorBgElevated: '#1a1a1a',
    }
  }
};
