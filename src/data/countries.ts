export interface Country {
  code: string;
  name: string;
  neighbors: string[];
  // rough center coords for map display
  lat: number;
  lng: number;
  // one or more emoji that evoke the country (landmark/food/animal/etc.),
  // falling back to the flag when we don't have anything more specific
  icons: string[];
}

// alpha-3 -> alpha-2, used to derive a flag emoji fallback for every country
const ISO2: Record<string, string> = {
  AFG: 'AF', ALB: 'AL', DZA: 'DZ', AND: 'AD', AGO: 'AO', ARG: 'AR', ARM: 'AM', AUT: 'AT',
  AZE: 'AZ', BGD: 'BD', BLR: 'BY', BEL: 'BE', BLZ: 'BZ', BEN: 'BJ', BTN: 'BT', BOL: 'BO',
  BIH: 'BA', BWA: 'BW', BRA: 'BR', BRN: 'BN', BGR: 'BG', BFA: 'BF', BDI: 'BI', KHM: 'KH',
  CMR: 'CM', CAN: 'CA', CAF: 'CF', TCD: 'TD', CHL: 'CL', CHN: 'CN', COL: 'CO', COD: 'CD',
  COG: 'CG', CRI: 'CR', HRV: 'HR', CZE: 'CZ', DNK: 'DK', DJI: 'DJ', DOM: 'DO', ECU: 'EC',
  EGY: 'EG', SLV: 'SV', GNQ: 'GQ', ERI: 'ER', EST: 'EE', SWZ: 'SZ', ETH: 'ET', FIN: 'FI',
  FRA: 'FR', GAB: 'GA', GMB: 'GM', GEO: 'GE', DEU: 'DE', GHA: 'GH', GRC: 'GR', GTM: 'GT',
  GIN: 'GN', GNB: 'GW', GUY: 'GY', GUF: 'GF', HTI: 'HT', HND: 'HN', HUN: 'HU', IND: 'IN',
  IDN: 'ID', IRN: 'IR', IRQ: 'IQ', IRL: 'IE', ISR: 'IL', ITA: 'IT', JOR: 'JO', KAZ: 'KZ',
  KEN: 'KE', PRK: 'KP', KOR: 'KR', XKX: 'XK', KWT: 'KW', KGZ: 'KG', LAO: 'LA', LVA: 'LV',
  LBN: 'LB', LSO: 'LS', LBR: 'LR', LBY: 'LY', LIE: 'LI', LTU: 'LT', LUX: 'LU', MWI: 'MW',
  MYS: 'MY', MLI: 'ML', MRT: 'MR', MEX: 'MX', MDA: 'MD', MCO: 'MC', MNG: 'MN', MNE: 'ME',
  MAR: 'MA', MOZ: 'MZ', MMR: 'MM', NAM: 'NA', NPL: 'NP', NLD: 'NL', NIC: 'NI', NER: 'NE',
  NGA: 'NG', MKD: 'MK', NOR: 'NO', OMN: 'OM', PAK: 'PK', PSE: 'PS', PAN: 'PA', PNG: 'PG',
  PRY: 'PY', PER: 'PE', POL: 'PL', PRT: 'PT', QAT: 'QA', ROU: 'RO', RUS: 'RU', RWA: 'RW',
  SMR: 'SM', SAU: 'SA', SEN: 'SN', SRB: 'RS', SLE: 'SL', SGP: 'SG', SVK: 'SK', SVN: 'SI',
  SOM: 'SO', ZAF: 'ZA', SSD: 'SS', ESP: 'ES', SDN: 'SD', SUR: 'SR', SWE: 'SE', CHE: 'CH',
  SYR: 'SY', TWN: 'TW', TJK: 'TJ', TZA: 'TZ', THA: 'TH', TLS: 'TL', TGO: 'TG', TUN: 'TN',
  TUR: 'TR', TKM: 'TM', UGA: 'UG', UKR: 'UA', ARE: 'AE', GBR: 'GB', GIB: 'GI', USA: 'US',
  URY: 'UY', UZB: 'UZ', VAT: 'VA', VEN: 'VE', VNM: 'VN', ESH: 'EH', YEM: 'YE', ZMB: 'ZM',
  ZWE: 'ZW', CIV: 'CI',
};

function flagEmoji(alpha3: string): string {
  const iso2 = ISO2[alpha3];
  if (!iso2) return '🏳️';
  return String.fromCodePoint(...[...iso2].map(c => 0x1f1e6 + c.charCodeAt(0) - 65));
}

// Hand-picked emoji that evoke each country — a landmark, food, animal, or
// other cultural touchstone. Countries not listed here fall back to their flag.
const ICONS: Record<string, string[]> = {
  AFG: ['🏔️'], ALB: ['🦅'], DZA: ['🐫'], AND: ['⛷️'], AGO: ['💎'],
  ARG: ['🥩', '💃', '⚽'], ARM: ['🍑', '⛪'], AUT: ['🎻', '🏔️'], AZE: ['🔥'],
  BGD: ['🐅', '🌾'], BLR: ['🥔'], BEL: ['🍫', '🧇', '🍺'], BLZ: ['🐠'],
  BEN: ['🥁'], BTN: ['🐉', '🏔️'], BOL: ['🦙', '🏔️'], BIH: ['🌉'],
  BWA: ['🐘'], BRA: ['⚽', '💃', '🦜'], BRN: ['🕌'], BGR: ['🌹'],
  BFA: ['🌍'], BDI: ['🥁'], KHM: ['🛕'], CMR: ['🦁'],
  CAN: ['🍁', '🦫'], CAF: ['🌴'], TCD: ['🐪'], CHL: ['🗿', '🍷'],
  CHN: ['🐼', '🐉', '🥢'], COL: ['☕'], COD: ['🦍'], COG: ['🌴'],
  CRI: ['🦥', '🌴'], HRV: ['👔', '⚽'], CZE: ['🍺', '🏰'], DNK: ['🧜‍♀️', '🧱'],
  DJI: ['🐫'], DOM: ['⚾', '🏖️'], ECU: ['🐢'], EGY: ['🐫', '🌅'],
  SLV: ['🌋'], GNQ: ['🌴'], ERI: ['🐪'], EST: ['🎶', '🌲'],
  SWZ: ['🦁'], ETH: ['☕'], FIN: ['🧖', '🎅'], FRA: ['🗼', '🥖', '🧀'],
  GAB: ['🦍'], GMB: ['🥁'], GEO: ['🍷'], DEU: ['🍺', '🥨', '🚗'],
  GHA: ['🍫'], GRC: ['🏛️', '🫒'], GTM: ['🦜'], GIN: ['🌴'],
  GNB: ['🌴'], GUY: ['🌳'], GUF: ['🚀'], HTI: ['🥁'],
  HND: ['🌴'], HUN: ['🌶️'], IND: ['🐘', '🍛', '🕉️'], IDN: ['🌋', '🦎'],
  IRN: ['🐆', '🏺'], IRQ: ['🕌'], IRL: ['🍀', '🍺'], ISR: ['✡️'],
  ITA: ['🍕', '🍝', '🏛️'], JOR: ['🏜️', '🐪'], KAZ: ['🐎'], KEN: ['🦁', '🏃'],
  KOR: ['🎤', '🍲'], KWT: ['🛢️'], KGZ: ['🐎', '🏔️'], LAO: ['🛕'],
  LVA: ['🌲'], LBN: ['🌲'], LSO: ['🏔️'], LBR: ['🌴'],
  LBY: ['🐪'], LIE: ['🏔️'], LTU: ['🌲'], LUX: ['🏰'],
  MWI: ['🐟'], MYS: ['🐯', '🏙️'], MLI: ['🕌'], MRT: ['🐪'],
  MEX: ['🌮', '🌵'], MDA: ['🍷'], MCO: ['🎰', '🏎️'], MNG: ['🐎', '⛺'],
  MNE: ['🏔️'], MAR: ['🕌', '🐪'], MOZ: ['🌴'], MMR: ['🛕'],
  NAM: ['🏜️'], NPL: ['🏔️'], NLD: ['🌷', '🧀', '🚲'], NIC: ['🌋'],
  NER: ['🐪'], NGA: ['🎬', '🛢️'], MKD: ['🏔️'], NOR: ['🐟', '🏔️'],
  OMN: ['🐪'], PAK: ['🏔️'], PSE: ['🕌'], PAN: ['🚢'],
  PNG: ['🦜'], PRY: ['🌳'], PER: ['🦙', '🌽'], POL: ['🥟'],
  PRT: ['🐓', '🍷'], QAT: ['🛢️'], ROU: ['🧛', '🏰'], RUS: ['🪆', '🐻'],
  RWA: ['🦍'], SMR: ['🏰'], SAU: ['🕋', '🐪'], SEN: ['🦁'],
  SRB: ['🎾'], SLE: ['💎'], SGP: ['🦁', '🏙️'], SVK: ['🏔️'],
  SVN: ['🏔️'], SOM: ['🐫'], ZAF: ['🦁', '🍷'], SSD: ['🐪'],
  ESP: ['💃', '🐂', '🥘'], SDN: ['🐪'], SUR: ['🌳'], SWE: ['🪑', '❄️'],
  CHE: ['🍫', '🧀', '⛰️'], SYR: ['🕌'], TWN: ['🧋', '🏙️'], TJK: ['🏔️'],
  TZA: ['🦁', '🏔️'], THA: ['🐘', '🛕'], TLS: ['🌴'], TGO: ['🌴'],
  TUN: ['🕌'], TUR: ['🕌', '🫖'], TKM: ['🐪'], UGA: ['🦍'],
  UKR: ['🌻'], ARE: ['🏙️', '🐪'], GBR: ['☂️', '🫖', '👑'], GIB: ['🐒'],
  USA: ['🗽', '🍔', '🦅'], URY: ['🧉'], UZB: ['🐪'], VAT: ['⛪'],
  VEN: ['🛢️'], VNM: ['🍜', '🌾'], ESH: ['🐪'], YEM: ['☕'],
  ZMB: ['🦓'], ZWE: ['🐘'], CIV: ['🍫'],
};

// ISO 3166-1 alpha-3 codes + XKX (Kosovo), TWN (Taiwan), PSE (Palestine), ESH (Western Sahara), GUF (French Guiana)
const RAW: Array<[string, string, number, number, string[]]> = [
  // [code, name, lat, lng, neighbors]
  ['AFG', 'Afghanistan', 33.9, 67.7, ['CHN', 'IRN', 'PAK', 'TJK', 'TKM', 'UZB']],
  ['ALB', 'Albania', 41.2, 20.2, ['GRC', 'XKX', 'MKD', 'MNE']],
  ['DZA', 'Algeria', 28.0, 1.7, ['TUN', 'LBY', 'NER', 'MLI', 'MRT', 'MAR', 'ESH']],
  ['AND', 'Andorra', 42.5, 1.5, ['FRA', 'ESP']],
  ['AGO', 'Angola', -11.2, 17.9, ['COD', 'COG', 'NAM', 'ZMB']],
  ['ARG', 'Argentina', -38.4, -63.6, ['BOL', 'BRA', 'CHL', 'PRY', 'URY']],
  ['ARM', 'Armenia', 40.1, 45.0, ['AZE', 'GEO', 'IRN', 'TUR']],
  ['AUT', 'Austria', 47.5, 14.6, ['CZE', 'DEU', 'HUN', 'ITA', 'LIE', 'SVK', 'SVN', 'CHE']],
  ['AZE', 'Azerbaijan', 40.1, 47.6, ['ARM', 'GEO', 'IRN', 'RUS', 'TUR']],
  ['BGD', 'Bangladesh', 23.7, 90.4, ['IND', 'MMR']],
  ['BLR', 'Belarus', 53.7, 28.0, ['LVA', 'LTU', 'POL', 'RUS', 'UKR']],
  ['BEL', 'Belgium', 50.5, 4.5, ['FRA', 'DEU', 'LUX', 'NLD']],
  ['BLZ', 'Belize', 17.2, -88.5, ['GTM', 'MEX']],
  ['BEN', 'Benin', 9.3, 2.3, ['BFA', 'NER', 'NGA', 'TGO']],
  ['BTN', 'Bhutan', 27.5, 90.4, ['CHN', 'IND']],
  ['BOL', 'Bolivia', -16.3, -63.6, ['ARG', 'BRA', 'CHL', 'PRY', 'PER']],
  ['BIH', 'Bosnia and Herzegovina', 43.9, 17.7, ['HRV', 'MNE', 'SRB']],
  ['BWA', 'Botswana', -22.3, 24.7, ['NAM', 'ZAF', 'ZMB', 'ZWE']],
  ['BRA', 'Brazil', -14.2, -51.9, ['ARG', 'BOL', 'COL', 'GUY', 'PRY', 'PER', 'SUR', 'URY', 'VEN', 'GUF']],
  ['BRN', 'Brunei', 4.5, 114.7, ['MYS']],
  ['BGR', 'Bulgaria', 42.7, 25.5, ['GRC', 'MKD', 'ROU', 'SRB', 'TUR']],
  ['BFA', 'Burkina Faso', 12.4, -1.6, ['BEN', 'CIV', 'GHA', 'MLI', 'NER', 'TGO']],
  ['BDI', 'Burundi', -3.4, 29.9, ['COD', 'RWA', 'TZA']],
  ['KHM', 'Cambodia', 12.6, 104.9, ['LAO', 'THA', 'VNM']],
  ['CMR', 'Cameroon', 3.8, 11.5, ['CAF', 'TCD', 'COG', 'GNQ', 'GAB', 'NGA']],
  ['CAN', 'Canada', 56.1, -106.3, ['USA']],
  ['CAF', 'Central African Republic', 6.6, 20.9, ['CMR', 'TCD', 'COD', 'COG', 'SSD', 'SDN']],
  ['TCD', 'Chad', 15.5, 18.7, ['CMR', 'CAF', 'LBY', 'NER', 'NGA', 'SDN']],
  ['CHL', 'Chile', -35.7, -71.5, ['ARG', 'BOL', 'PER']],
  ['CHN', 'China', 35.9, 104.2, ['AFG', 'BTN', 'IND', 'KAZ', 'KGZ', 'LAO', 'MNG', 'MMR', 'NPL', 'PRK', 'PAK', 'RUS', 'TJK', 'VNM']],
  ['COL', 'Colombia', 4.6, -74.3, ['BRA', 'ECU', 'PAN', 'PER', 'VEN']],
  ['COD', 'DR Congo', -4.0, 21.8, ['AGO', 'BDI', 'CAF', 'COG', 'RWA', 'SSD', 'TZA', 'UGA', 'ZMB']],
  ['COG', 'Republic of the Congo', -0.2, 15.8, ['AGO', 'CMR', 'CAF', 'COD', 'GAB']],
  ['CRI', 'Costa Rica', 9.7, -83.8, ['NIC', 'PAN']],
  ['HRV', 'Croatia', 45.1, 15.2, ['BIH', 'HUN', 'MNE', 'SRB', 'SVN']],
  ['CZE', 'Czech Republic', 49.8, 15.5, ['AUT', 'DEU', 'POL', 'SVK']],
  ['DNK', 'Denmark', 56.3, 9.5, ['DEU']],
  ['DJI', 'Djibouti', 11.8, 42.6, ['ERI', 'ETH', 'SOM']],
  ['DOM', 'Dominican Republic', 18.7, -70.2, ['HTI']],
  ['ECU', 'Ecuador', -1.8, -78.2, ['COL', 'PER']],
  ['EGY', 'Egypt', 26.8, 30.8, ['ISR', 'LBY', 'PSE', 'SDN']],
  ['SLV', 'El Salvador', 13.8, -88.9, ['GTM', 'HND']],
  ['GNQ', 'Equatorial Guinea', 1.7, 10.3, ['CMR', 'GAB']],
  ['ERI', 'Eritrea', 15.2, 39.8, ['DJI', 'ETH', 'SDN']],
  ['EST', 'Estonia', 58.6, 25.0, ['LVA', 'RUS']],
  ['SWZ', 'Eswatini', -26.5, 31.5, ['MOZ', 'ZAF']],
  ['ETH', 'Ethiopia', 9.1, 40.5, ['DJI', 'ERI', 'KEN', 'SOM', 'SSD', 'SDN']],
  ['FIN', 'Finland', 61.9, 25.7, ['NOR', 'RUS', 'SWE']],
  ['FRA', 'France', 46.2, 2.2, ['AND', 'BEL', 'DEU', 'ITA', 'LUX', 'MCO', 'ESP', 'CHE', 'GUF']],
  ['GAB', 'Gabon', -0.8, 11.6, ['CMR', 'COG', 'GNQ']],
  ['GMB', 'Gambia', 13.4, -15.3, ['SEN']],
  ['GEO', 'Georgia', 42.3, 43.4, ['ARM', 'AZE', 'RUS', 'TUR']],
  ['DEU', 'Germany', 51.2, 10.5, ['AUT', 'BEL', 'CZE', 'DNK', 'FRA', 'LUX', 'NLD', 'POL', 'CHE']],
  ['GHA', 'Ghana', 7.9, -1.0, ['BFA', 'CIV', 'TGO']],
  ['GRC', 'Greece', 39.1, 21.8, ['ALB', 'BGR', 'MKD', 'TUR']],
  ['GTM', 'Guatemala', 15.8, -90.2, ['BLZ', 'SLV', 'HND', 'MEX']],
  ['GIN', 'Guinea', 11.0, -10.9, ['CIV', 'GNB', 'LBR', 'MLI', 'SEN', 'SLE']],
  ['GNB', 'Guinea-Bissau', 11.8, -15.2, ['GIN', 'SEN']],
  ['GUY', 'Guyana', 4.9, -58.9, ['BRA', 'SUR', 'VEN']],
  ['GUF', 'French Guiana', 3.9, -53.1, ['BRA', 'FRA', 'SUR']],
  ['HTI', 'Haiti', 18.9, -72.3, ['DOM']],
  ['HND', 'Honduras', 15.2, -86.2, ['SLV', 'GTM', 'NIC']],
  ['HUN', 'Hungary', 47.2, 19.5, ['AUT', 'HRV', 'ROU', 'SRB', 'SVK', 'SVN', 'UKR']],
  ['IND', 'India', 20.6, 79.1, ['BGD', 'BTN', 'CHN', 'MMR', 'NPL', 'PAK']],
  ['IDN', 'Indonesia', -0.8, 113.9, ['TLS', 'MYS', 'PNG']],
  ['IRN', 'Iran', 32.4, 53.7, ['AFG', 'ARM', 'AZE', 'IRQ', 'PAK', 'TUR', 'TKM']],
  ['IRQ', 'Iraq', 33.2, 43.7, ['IRN', 'JOR', 'KWT', 'SAU', 'SYR', 'TUR']],
  ['IRL', 'Ireland', 53.4, -8.2, ['GBR']],
  ['ISR', 'Israel', 31.0, 34.9, ['EGY', 'JOR', 'LBN', 'PSE', 'SYR']],
  ['ITA', 'Italy', 41.9, 12.6, ['AUT', 'FRA', 'SMR', 'SVN', 'CHE', 'VAT']],
  ['JOR', 'Jordan', 30.6, 36.2, ['IRQ', 'ISR', 'PSE', 'SAU', 'SYR']],
  ['KAZ', 'Kazakhstan', 48.0, 66.9, ['CHN', 'KGZ', 'RUS', 'TKM', 'UZB']],
  ['KEN', 'Kenya', -0.0, 37.9, ['ETH', 'SOM', 'SSD', 'TZA', 'UGA']],
  ['PRK', 'North Korea', 40.3, 127.5, ['CHN', 'RUS', 'KOR']],
  ['KOR', 'South Korea', 35.9, 127.8, ['PRK']],
  ['XKX', 'Kosovo', 42.6, 20.9, ['ALB', 'MKD', 'MNE', 'SRB']],
  ['KWT', 'Kuwait', 29.3, 47.5, ['IRQ', 'SAU']],
  ['KGZ', 'Kyrgyzstan', 41.2, 74.8, ['CHN', 'KAZ', 'TJK', 'UZB']],
  ['LAO', 'Laos', 19.9, 102.5, ['KHM', 'CHN', 'MMR', 'THA', 'VNM']],
  ['LVA', 'Latvia', 56.9, 24.6, ['BLR', 'EST', 'LTU', 'RUS']],
  ['LBN', 'Lebanon', 33.9, 35.9, ['ISR', 'SYR']],
  ['LSO', 'Lesotho', -29.6, 28.2, ['ZAF']],
  ['LBR', 'Liberia', 6.4, -9.4, ['CIV', 'GIN', 'SLE']],
  ['LBY', 'Libya', 26.3, 17.2, ['DZA', 'TCD', 'EGY', 'NER', 'SDN', 'TUN']],
  ['LIE', 'Liechtenstein', 47.1, 9.6, ['AUT', 'CHE']],
  ['LTU', 'Lithuania', 55.2, 23.9, ['BLR', 'LVA', 'POL', 'RUS']],
  ['LUX', 'Luxembourg', 49.8, 6.1, ['BEL', 'FRA', 'DEU']],
  ['MWI', 'Malawi', -13.3, 34.3, ['MOZ', 'TZA', 'ZMB']],
  ['MYS', 'Malaysia', 4.2, 108.0, ['BRN', 'IDN', 'SGP', 'THA']],
  ['MLI', 'Mali', 17.6, -4.0, ['DZA', 'BFA', 'GIN', 'CIV', 'MRT', 'NER', 'SEN']],
  ['MRT', 'Mauritania', 21.0, -10.9, ['DZA', 'MLI', 'MAR', 'SEN', 'ESH']],
  ['MEX', 'Mexico', 23.6, -102.6, ['BLZ', 'GTM', 'USA']],
  ['MDA', 'Moldova', 47.4, 28.4, ['ROU', 'UKR']],
  ['MCO', 'Monaco', 43.7, 7.4, ['FRA']],
  ['MNG', 'Mongolia', 46.9, 103.8, ['CHN', 'RUS']],
  ['MNE', 'Montenegro', 42.7, 19.4, ['ALB', 'BIH', 'HRV', 'XKX', 'SRB']],
  ['MAR', 'Morocco', 31.8, -7.1, ['DZA', 'MRT', 'ESP', 'ESH']],
  ['MOZ', 'Mozambique', -18.7, 35.5, ['SWZ', 'MWI', 'ZAF', 'TZA', 'ZMB', 'ZWE']],
  ['MMR', 'Myanmar', 21.9, 96.4, ['BGD', 'CHN', 'IND', 'LAO', 'THA']],
  ['NAM', 'Namibia', -22.0, 17.1, ['AGO', 'BWA', 'ZAF', 'ZMB']],
  ['NPL', 'Nepal', 28.4, 84.1, ['CHN', 'IND']],
  ['NLD', 'Netherlands', 52.1, 5.3, ['BEL', 'DEU']],
  ['NIC', 'Nicaragua', 12.9, -85.2, ['CRI', 'HND']],
  ['NER', 'Niger', 17.6, 8.1, ['DZA', 'BEN', 'BFA', 'TCD', 'LBY', 'MLI', 'NGA']],
  ['NGA', 'Nigeria', 9.1, 8.7, ['BEN', 'CMR', 'TCD', 'NER']],
  ['MKD', 'North Macedonia', 41.6, 21.7, ['ALB', 'BGR', 'GRC', 'XKX', 'SRB']],
  ['NOR', 'Norway', 60.5, 8.5, ['FIN', 'RUS', 'SWE']],
  ['OMN', 'Oman', 21.5, 55.9, ['SAU', 'ARE', 'YEM']],
  ['PAK', 'Pakistan', 30.4, 69.3, ['AFG', 'CHN', 'IND', 'IRN']],
  ['PSE', 'Palestine', 31.9, 35.2, ['EGY', 'ISR', 'JOR']],
  ['PAN', 'Panama', 8.5, -80.8, ['COL', 'CRI']],
  ['PNG', 'Papua New Guinea', -6.3, 143.9, ['IDN']],
  ['PRY', 'Paraguay', -23.4, -58.4, ['ARG', 'BOL', 'BRA']],
  ['PER', 'Peru', -9.2, -75.0, ['BOL', 'BRA', 'CHL', 'COL', 'ECU']],
  ['POL', 'Poland', 51.9, 19.1, ['BLR', 'CZE', 'DEU', 'LTU', 'RUS', 'SVK', 'UKR']],
  ['PRT', 'Portugal', 39.4, -8.2, ['ESP']],
  ['QAT', 'Qatar', 25.4, 51.2, ['SAU']],
  ['ROU', 'Romania', 45.9, 24.9, ['BGR', 'HUN', 'MDA', 'SRB', 'UKR']],
  ['RUS', 'Russia', 61.5, 105.3, ['AZE', 'BLR', 'CHN', 'EST', 'FIN', 'GEO', 'KAZ', 'LVA', 'LTU', 'MNG', 'PRK', 'NOR', 'POL', 'UKR']],
  ['RWA', 'Rwanda', -1.9, 29.9, ['BDI', 'COD', 'TZA', 'UGA']],
  ['SMR', 'San Marino', 43.9, 12.5, ['ITA']],
  ['SAU', 'Saudi Arabia', 24.2, 45.1, ['IRQ', 'JOR', 'KWT', 'OMN', 'QAT', 'ARE', 'YEM']],
  ['SEN', 'Senegal', 14.5, -14.5, ['GMB', 'GIN', 'GNB', 'MLI', 'MRT']],
  ['SRB', 'Serbia', 44.0, 21.0, ['BIH', 'BGR', 'HRV', 'HUN', 'XKX', 'MKD', 'MNE', 'ROU']],
  ['SLE', 'Sierra Leone', 8.5, -11.8, ['GIN', 'LBR']],
  ['SGP', 'Singapore', 1.4, 103.8, ['MYS']],
  ['SVK', 'Slovakia', 48.7, 19.7, ['AUT', 'CZE', 'HUN', 'POL', 'UKR']],
  ['SVN', 'Slovenia', 46.2, 15.0, ['AUT', 'HRV', 'HUN', 'ITA']],
  ['SOM', 'Somalia', 5.2, 46.2, ['DJI', 'ETH', 'KEN']],
  ['ZAF', 'South Africa', -30.6, 22.9, ['BWA', 'SWZ', 'LSO', 'MOZ', 'NAM', 'ZWE']],
  ['SSD', 'South Sudan', 7.9, 30.2, ['CAF', 'COD', 'ETH', 'KEN', 'SDN', 'UGA']],
  ['ESP', 'Spain', 40.5, -3.7, ['AND', 'FRA', 'GIB', 'MAR', 'PRT']],
  ['SDN', 'Sudan', 12.9, 30.2, ['CAF', 'TCD', 'EGY', 'ERI', 'ETH', 'LBY', 'SSD']],
  ['SUR', 'Suriname', 3.9, -56.0, ['BRA', 'GUY', 'GUF']],
  ['SWE', 'Sweden', 63.0, 16.5, ['FIN', 'NOR']],
  ['CHE', 'Switzerland', 46.8, 8.2, ['AUT', 'FRA', 'DEU', 'ITA', 'LIE']],
  ['SYR', 'Syria', 35.0, 38.0, ['IRQ', 'ISR', 'JOR', 'LBN', 'TUR']],
  ['TWN', 'Taiwan', 23.7, 121.0, []],
  ['TJK', 'Tajikistan', 38.9, 71.3, ['AFG', 'CHN', 'KGZ', 'UZB']],
  ['TZA', 'Tanzania', -6.4, 34.9, ['BDI', 'COD', 'KEN', 'MWI', 'MOZ', 'RWA', 'UGA', 'ZMB']],
  ['THA', 'Thailand', 15.9, 100.9, ['KHM', 'LAO', 'MYS', 'MMR']],
  ['TLS', 'East Timor', -8.9, 125.7, ['IDN']],
  ['TGO', 'Togo', 8.6, 0.8, ['BEN', 'BFA', 'GHA']],
  ['TUN', 'Tunisia', 33.9, 9.6, ['DZA', 'LBY']],
  ['TUR', 'Turkey', 38.9, 35.2, ['ARM', 'AZE', 'BGR', 'GEO', 'GRC', 'IRN', 'IRQ', 'SYR']],
  ['TKM', 'Turkmenistan', 38.9, 59.6, ['AFG', 'IRN', 'KAZ', 'UZB']],
  ['UGA', 'Uganda', 1.4, 32.3, ['COD', 'KEN', 'RWA', 'SSD', 'TZA']],
  ['UKR', 'Ukraine', 48.4, 31.2, ['BLR', 'HUN', 'MDA', 'POL', 'ROU', 'RUS', 'SVK']],
  ['ARE', 'United Arab Emirates', 23.4, 53.8, ['OMN', 'SAU']],
  ['GBR', 'United Kingdom', 55.4, -3.4, ['IRL']],
  ['GIB', 'Gibraltar', 36.1, -5.3, ['ESP']],
  ['USA', 'United States', 37.1, -95.7, ['CAN', 'MEX']],
  ['URY', 'Uruguay', -32.5, -55.8, ['ARG', 'BRA']],
  ['UZB', 'Uzbekistan', 41.4, 64.6, ['AFG', 'KAZ', 'KGZ', 'TJK', 'TKM']],
  ['VAT', 'Vatican City', 41.9, 12.5, ['ITA']],
  ['VEN', 'Venezuela', 6.4, -66.6, ['BRA', 'COL', 'GUY']],
  ['VNM', 'Vietnam', 14.1, 108.3, ['KHM', 'CHN', 'LAO']],
  ['ESH', 'Western Sahara', 24.2, -12.9, ['DZA', 'MRT', 'MAR']],
  ['YEM', 'Yemen', 15.6, 48.5, ['OMN', 'SAU']],
  ['ZMB', 'Zambia', -13.1, 27.8, ['AGO', 'BWA', 'COD', 'MWI', 'MOZ', 'NAM', 'TZA', 'ZWE']],
  ['ZWE', 'Zimbabwe', -19.0, 29.2, ['BWA', 'MOZ', 'ZAF', 'ZMB']],
  ['CIV', "Côte d'Ivoire", 7.5, -5.5, ['BFA', 'GHA', 'GIN', 'LBR', 'MLI']],
];

export const COUNTRIES: Record<string, Country> = {};
export const COUNTRY_LIST: Country[] = [];

for (const [code, name, lat, lng, neighbors] of RAW) {
  const icons = ICONS[code] ?? [flagEmoji(code)];
  const country: Country = { code, name, lat, lng, neighbors, icons };
  COUNTRIES[code] = country;
  COUNTRY_LIST.push(country);
}

// Sort list alphabetically by name for search
COUNTRY_LIST.sort((a, b) => a.name.localeCompare(b.name));

export function searchCountries(query: string): Country[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return COUNTRY_LIST.filter(c => c.name.toLowerCase().includes(q)).slice(0, 8);
}

export function areNeighbors(a: string, b: string): boolean {
  return COUNTRIES[a]?.neighbors.includes(b) ?? false;
}

// Deterministically pick a single emoji from a country's icon pool — same
// country always resolves to the same icon (stable across re-renders and if
// the same country appears more than once), just picked via a simple hash
// rather than always taking the first one in the list.
export function pickIcon(code: string): string {
  const icons = COUNTRIES[code]?.icons;
  if (!icons || icons.length === 0) return '';
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) >>> 0;
  return icons[hash % icons.length];
}
