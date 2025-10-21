export const SERVICE_COLORS = {
  Haircut:   '#AD947F',
  Color:     '#8A7563',
  Highlights:'#D2BFAF',
  BlowDry:   '#F1DCC3',
  Treatment: '#B0BEC5',
  Other:     '#C8C8C8',
};
export const colorForService = (s) => SERVICE_COLORS[s] || SERVICE_COLORS.Other;
