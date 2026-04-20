// ============================================================
// Design: "Black Vault" — Dark Luxury / Fintech Premium
// Dados completos dos 94 clientes extraídos do portal Onil Group
// Patrimônio real conforme painel de gestão: R$ 7.027.927,18
// ============================================================

export interface Client {
  id: number;
  name: string;
  registered: string;
  email: string;
  phone: string;
  birthDate: string;
  totalBRL: number;
  status: "Ativado" | "Inativo";
  walletBRL: number;
  walletUSDT: number;
  walletBTC: number;
  walletETH: number;
  securityBRL: number;
  expertBRL: number;
  secBRL: number;
  expBRL: number;
  securityUSDT: number;
  expertUSDT: number;
  secUSDT: number;
  expUSDT: number;
  securityBTC: number;
  secBTC: number;
  securityETH: number;
  secETH: number;
  // Campos adicionais para métricas
  capitalAportado?: number;
  totalDepositos?: number;
  totalSaques?: number;
  rendimentoTotal?: number;
  rendimentoPercentual?: number;
  rendimentoMensal?: number;
}

// Patrimônio real conforme painel de gestão Onil
export const PATRIMONIO_REAL = 7027927.18;

export const clients: Client[] = [
  { id: 10041, name: "Gilvandro Rodrigues Garcia", registered: "13/05/2024", email: "gilvandro@escgarcia.com.br", phone: "+5544999748100", birthDate: "07/11/1981", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 10078, name: "Hil Deor Martins Silva", registered: "16/05/2024", email: "hil.martins@yahoo.com.br", phone: "+5561996835601", birthDate: "14/12/1958", totalBRL: 234560.56, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 178280.6, secBRL: 0.0, expBRL: 56279.95, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 10096, name: "Juliana Oenning de Matos Garcia", registered: "17/05/2024", email: "escgarcia@escgarcia.com.br", phone: "+5544999748100", birthDate: "09/04/1999", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 10240, name: "Carlos Eduardo Maia", registered: "28/05/2024", email: "caemaia@hotmail.com", phone: "+5544988366613", birthDate: "16/11/1981", totalBRL: 19874.12, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 19874.12, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 10578, name: "Hamilton Alves da Silva", registered: "19/06/2024", email: "hamiltonsilva00@outlook.com", phone: "+5544988483554", birthDate: "07/09/1970", totalBRL: 72438.44, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 49030.26, expBRL: 23408.17, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 2152, name: "Detlef Karklin Wolter", registered: "31/03/2021", email: "detlefkwolter@gmail.com", phone: "+5519997027445", birthDate: "28/08/1990", totalBRL: 69341.98, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 50707.9, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.05203751, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 2202, name: "Mario Peres Filho", registered: "22/04/2021", email: "imobiliariaperes@live.com", phone: "+5544999655543", birthDate: "22/03/1967", totalBRL: 83086.19, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.00928078, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.23202636, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 2211, name: "Ed Wilson Baldan Mendes", registered: "23/04/2021", email: "casagrande.ltda@hotmail.com", phone: "+5544991347053", birthDate: "01/01/1971", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 2224, name: "Willie Cesar Oehninger", registered: "26/04/2021", email: "willie.cesar@hotmail.com", phone: "+5544997003888", birthDate: "22/12/1988", totalBRL: 23646.48, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 2.29486399, secETH: 0.0 },
  { id: 2325, name: "Tainara do Nascimento Andrade da Cunha", registered: "24/05/2021", email: "tats.andrade@hotmail.com", phone: "+5544999408006", birthDate: "25/07/1994", totalBRL: 104041.44, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.20117743, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 10.09710177, secETH: 0.0 },
  { id: 2327, name: "Leandro Peres da Cunha", registered: "24/05/2021", email: "perescunha@hotmail.com", phone: "+5544998775643", birthDate: "04/06/1989", totalBRL: 34870.98, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 1e-08, securityBRL: 0.0, expertBRL: 1814.55, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.05617292, secBTC: 0.0, securityETH: 1.25595819, secETH: 0.0 },
  { id: 2346, name: "Fernando Rodrigues dos Santos", registered: "28/05/2021", email: "fernandorodrigues1990@hotmail.com", phone: "+5544999730725", birthDate: "15/05/1985", totalBRL: 1361.3, status: "Inativo" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 1361.3, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 2663, name: "Fabrício Sakashita", registered: "18/08/2021", email: "sakashitashop@gmail.com", phone: "+5511986264233", birthDate: "27/11/1980", totalBRL: 861659.77, status: "Ativado" as const, walletBRL: 48000.0, walletUSDT: 0.0, walletBTC: 0.03438775, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 108552.62, expBRL: 416492.83, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 6874.31, securityBTC: 0.25614923, secBTC: 0.0, securityETH: 20.17663747, secETH: 0.0 },
  { id: 2866, name: "Rafael Coelho Batalha", registered: "04/11/2021", email: "rafaelcoelhoooo@hotmail.com", phone: "+4444999180002", birthDate: "04/06/1985", totalBRL: 0.0, status: "Inativo" as const, walletBRL: 0.05, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 3010, name: "Herivelton Henrique Maso", registered: "13/12/2021", email: "heriveltonhenriquem@gmail.com", phone: "+5544999769781", birthDate: "29/01/1978", totalBRL: 410554.93, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.01467833, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.85735, secBTC: 0.0, securityETH: 10.0491098, secETH: 0.0 },
  { id: 3036, name: "Vildomar Ribeiro de Almeida", registered: "21/12/2021", email: "vildo-fire@hotmail.com", phone: "+5544999919776", birthDate: "07/08/1974", totalBRL: 4615.3, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.44791047, secETH: 0.0 },
  { id: 3094, name: "Renan Gomes do Nascimento", registered: "12/01/2022", email: "gomesrenan648@gmail.com", phone: "+5544999870011", birthDate: "19/04/1997", totalBRL: 66451.17, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 21273.5, expBRL: 10712.73, securityUSDT: 3976.61, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 2613.24, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 3274, name: "Sonia Mioto Visotto", registered: "15/02/2022", email: "mazzosonia@hotmail.com", phone: "+5511960669233", birthDate: "21/01/1971", totalBRL: 154326.85, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 152356.34, secBRL: 0.0, expBRL: 1970.51, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 3466, name: "Marisa do Nascimento Fabricio Andrade", registered: "31/03/2022", email: "marisaandradefotos@hotmail.com", phone: "+5544998311197", birthDate: "03/03/1964", totalBRL: 57102.21, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 16710.88, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.11279677, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 3556, name: "Luana Vieira Dias", registered: "18/04/2022", email: "luvieiradiaspr@gmail.com", phone: "+5544991431458", birthDate: "18/07/1996", totalBRL: 42144.3, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 34097.31, secBRL: 0.0, expBRL: 3063.63, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.01278889, secBTC: 0.0, securityETH: 0.03918736, secETH: 0.0 },
  { id: 4314, name: "Marília Alves Coutinho", registered: "30/09/2022", email: "mariliaalves_@live.com", phone: "+5561993176213", birthDate: "21/09/1991", totalBRL: 58244.85, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 31610.6, expertBRL: 2533.61, secBRL: 1391.68, expBRL: 22708.93, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 4573, name: "Mario Peres Fernandes", registered: "08/11/2022", email: "linker.onil@hotmail.com", phone: "+5544999465656", birthDate: "02/06/1938", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 4985, name: "Fernanda de Fátima Ruiz", registered: "13/01/2023", email: "fernandarg1305@hotmail.com", phone: "+5544997092337", birthDate: "13/05/1985", totalBRL: 165353.83, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 23132.98, expBRL: 116658.91, securityUSDT: 1660.51, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.02752464, secBTC: 0.0, securityETH: 0.68139751, secETH: 0.0 },
  { id: 5380, name: "Lorenzo Andrade Peres da Cunha", registered: "", email: "", phone: "--", birthDate: "--", totalBRL: 11350.84, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 1.10158661, secETH: 0.0 },
  { id: 5417, name: "Raisa Zago Falkine", registered: "15/03/2023", email: "raisa_zf@hotmail.com", phone: "+5519993469823", birthDate: "08/06/1992", totalBRL: 475771.61, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 192576.02, secBRL: 0.0, expBRL: 132667.13, securityUSDT: 4428.02, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 9296.77, securityBTC: 0.21991088, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 6335, name: "Paulo da Graça", registered: "13/07/2023", email: "paulodagracacs@gmail.com", phone: "+5511910251974", birthDate: "18/08/1974", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 6810, name: "Pedro Henrique Tavares Fernandes", registered: "24/08/2023", email: "pedrotavaresf@hotmail.com", phone: "+5544999664140", birthDate: "04/03/1996", totalBRL: 2994.94, status: "Ativado" as const, walletBRL: 421.65, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 2092.5, secBRL: 50.0, expBRL: 852.44, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 68194, name: "Cássio Henrique Moreira Reis", registered: "09/07/2024", email: "cassioreis749@gmail.com", phone: "+5544999195639", birthDate: "26/02/1987", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 68304, name: "Vilson Visotto", registered: "16/07/2024", email: "visotto@visottoimoveis.com.br", phone: "+5511949082055", birthDate: "25/02/1968", totalBRL: 154845.33, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 989.77, secBRL: 0.0, expBRL: 153855.55, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 68338, name: "Jamile Abou Nouh", registered: "18/07/2024", email: "anouh@uol.com.br", phone: "+5511999881816", birthDate: "09/11/1953", totalBRL: 33952.03, status: "Ativado" as const, walletBRL: 776.13, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 33952.03, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 68399, name: "Emídio Ferreira da Silva Júnior", registered: "23/07/2024", email: "paulasantoro2013@hotmail.com", phone: "+5544999693456", birthDate: "13/03/1987", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 68627, name: "Guilhermo Murillo da Cruz", registered: "05/08/2024", email: "guilhermo.cruz@hotmail.com", phone: "+5544999365540", birthDate: "03/12/1985", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 68690, name: "Andre Lourensetti Bocchi", registered: "08/08/2024", email: "andrebuk@hotmail.com", phone: "+5544991457828", birthDate: "01/11/1981", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 68880, name: "Luan Henrique Vieira Dias", registered: "20/08/2024", email: "luannzinho4000@gmail.com", phone: "+5544991623767", birthDate: "17/06/2002", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 68941, name: "Marlon Acácio Rodrigues de Almeida", registered: "22/08/2024", email: "marlonvlog14@gmail.com", phone: "+5544991724303", birthDate: "14/11/2003", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 69223, name: "Claudemir Nunes da Silva Ribeiro", registered: "09/09/2024", email: "claudemirnunes.2010@hotmail.com", phone: "+5544998088444", birthDate: "16/05/1982", totalBRL: 0.0, status: "Inativo" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 69492, name: "Genival da Silva Almeida Júnior", registered: "22/09/2024", email: "genival300186@gmail.com", phone: "+5595991735530", birthDate: "30/01/1986", totalBRL: 6865.96, status: "Ativado" as const, walletBRL: 2.77, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 2096.54, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.46286618, secETH: 0.0 },
  { id: 69570, name: "Jábilly Gutierrez Balbino Lopes", registered: "26/09/2024", email: "jabilly@ahbgrupo.com.br", phone: "+5544998178000", birthDate: "07/08/1993", totalBRL: 124805.59, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 111237.33, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 1.31678396, secETH: 0.0 },
  { id: 69608, name: "Agrofort Industria de Maquinas Ltda", registered: "28/09/2024", email: "jabilly@avicia.com.br", phone: "+5544998178000", birthDate: "13/11/2020", totalBRL: 14887.91, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 14887.91, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 70309, name: "Romário Aparecido Serench do Nascimento", registered: "04/11/2024", email: "ra10empreiteiracivil@gmail.com", phone: "+5544997246809", birthDate: "06/08/1989", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 7034, name: "Adeilton Ferreira Regis", registered: "13/09/2023", email: "adeiltonregis97@gmail.com", phone: "+5544997562756", birthDate: "20/08/1997", totalBRL: 13336.54, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0001044, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 604.51, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.00210408, secBTC: 0.0, securityETH: 1.15218179, secETH: 0.0 },
  { id: 70559, name: "Ana Paula Fukuoka Gomes", registered: "15/11/2024", email: "anapaula_fukuoka@hotmail.com", phone: "+5541987141991", birthDate: "23/06/1982", totalBRL: 150000.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 100000.0, expBRL: 50000.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 70760, name: "Danillo Carlos Silva Guedes", registered: "25/11/2024", email: "danillodan54@hotmail.com", phone: "+5562981326812", birthDate: "30/10/2024", totalBRL: 76594.76, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 7.37026764, secETH: 0.0 },
  { id: 70801, name: "Gabriel Vicente Soares", registered: "26/11/2024", email: "gvsoaresunb@gmail.com", phone: "+5561985466187", birthDate: "17/06/1994", totalBRL: 77744.7, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 72744.7, expBRL: 5000.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 71013, name: "Neimar Coser", registered: "04/12/2024", email: "neimar.coser@icloud.com", phone: "+5545999972537", birthDate: "05/02/1984", totalBRL: 112942.75, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 49368.71, expBRL: 28451.43, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 3.40860867, secETH: 0.0 },
  { id: 7130, name: "Eteliane Fleck Barboza", registered: "21/09/2023", email: "eteliane.barboza@gmail.com", phone: "+5592991889139", birthDate: "14/11/1982", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 71340, name: "Luiz Carlos Vieira Filho", registered: "16/12/2024", email: "drluizvieira@hotmail.com", phone: "+5545999247724", birthDate: "22/07/1983", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 71446, name: "James William dos Santos", registered: "19/12/2024", email: "eng.james@gmail.com", phone: "+5544999199105", birthDate: "27/07/1977", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 71634, name: "Andrade & Fabricio Ltda", registered: "03/01/2025", email: "taiseandrade@hotmail.com", phone: "+5544999509527", birthDate: "31/08/1970", totalBRL: 62944.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 50000.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.03592596, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 71797, name: "Silvana Paula Gomes Ferreira", registered: "09/01/2025", email: "silvanapaulaf@hotmail.com", phone: "+5544991439462", birthDate: "28/10/1966", totalBRL: 210164.07, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 33079.02, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.075, secBTC: 0.0, securityETH: 1.0, secETH: 0.0 },
  { id: 71826, name: "José Araújo Lacerda Filho", registered: "10/01/2025", email: "josearaujoconstrucoes33@gmail.com", phone: "+5511945293386", birthDate: "04/06/1976", totalBRL: 512.48, status: "Ativado" as const, walletBRL: 26.16, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 512.48, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 71924, name: "Diogo Medeiros Teixeira", registered: "14/01/2025", email: "diogomt@gmail.com", phone: "+5548984118959", birthDate: "09/10/1978", totalBRL: 17491.18, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 1.69749931, secETH: 0.0 },
  { id: 71934, name: "Thiago Roberto Fukuoka", registered: "15/01/2025", email: "thiagofukuoka1@gmail.com", phone: "+818032872427", birthDate: "11/03/1985", totalBRL: 115042.85, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 60535.09, securityUSDT: 943.06, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 9479.07, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 72247, name: "Marquezan Renato Pereira", registered: "27/01/2025", email: "renatop.pmf@gmail.com", phone: "+5548984685137", birthDate: "01/05/1983", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 72292, name: "Elton Sanches da Silva", registered: "29/01/2025", email: "eltonsanchess@icloud.com", phone: "+5544984022157", birthDate: "21/03/1983", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 72840, name: "Raul Siqueira Rohling", registered: "17/02/2025", email: "raul_rohling@icloud.com", phone: "+5544999376179", birthDate: "16/08/1988", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 72959, name: "Olesports Tecnologia e Intermediacao ...", registered: "20/02/2025", email: "olesportsfoundation@gmail.com", phone: "+5567993226559", birthDate: "19/08/2021", totalBRL: 0.0, status: "Inativo" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 73441, name: "Taiane do Nascimento Andrade Boccato", registered: "09/03/2025", email: "taiane.taty@gmail.com", phone: "+5544999597812", birthDate: "18/09/1989", totalBRL: 34182.92, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 1036.68, expBRL: 33146.23, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 73830, name: "Claudio A Andrade", registered: "20/03/2025", email: "jmmclaudio@hotmail.com", phone: "+5541991858886", birthDate: "01/08/1954", totalBRL: 26204.55, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 26204.55, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 73982, name: "Luah Varli da Rocha Cortes", registered: "25/03/2025", email: "cortesluah@gmail.com", phone: "+5562996830787", birthDate: "10/04/1998", totalBRL: 101688.56, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 100000.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 322.86, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 75312, name: "Alan Esteves Silva", registered: "05/05/2025", email: "alanesteves17@hotmail.com", phone: "+5544999383595", birthDate: "24/10/1987", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 75409, name: "Celso de Gois Ferreira Junior", registered: "08/05/2025", email: "celsogois10junior@gmail.com", phone: "+5567981955361", birthDate: "10/12/1994", totalBRL: 183147.33, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 35018.61, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 75511, name: "Marlow Holland Martins", registered: "10/05/2025", email: "marlowmarins@gmail.com", phone: "+5512992594906", birthDate: "01/12/1988", totalBRL: 80777.88, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 7530.67, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 7914.42, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 7596, name: "Djalma Francisco da Silva", registered: "01/11/2023", email: "djalma.francisco.cabelo@gmail.com", phone: "+5544999465656", birthDate: "10/08/1961", totalBRL: 30000.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 30000.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 76270, name: "Paulo Roberto Fukuoka", registered: "30/05/2025", email: "fukuokap@hotmail.com", phone: "+5541988296284", birthDate: "30/04/1958", totalBRL: 100348.5, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 34416.96, expBRL: 34635.35, securityUSDT: 5983.97, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 76410, name: "Regina Célia Fukuoka", registered: "03/06/2025", email: "fukuokaregin@hotmail.com", phone: "+5541997473356", birthDate: "29/03/1959", totalBRL: 11292.5, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 2159.17, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 7645, name: "Walter do Nascimento Andrade", registered: "07/11/2023", email: "foto_paranavai@hotmail.com", phone: "+5544998312302", birthDate: "15/06/1958", totalBRL: 120841.83, status: "Ativado" as const, walletBRL: 1872.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 65638.7, expBRL: 24255.22, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.08642508, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 7656, name: "Wander Henrique Monteiro 09471998964", registered: "08/11/2023", email: "henriquemrezende@hotmail.com", phone: "+5544991831461", birthDate: "04/02/2016", totalBRL: 37295.09, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 23346.38, secBRL: 0.0, expBRL: 13948.71, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 76620, name: "Vilma Olimpia Visotto", registered: "09/06/2025", email: "vilmavisotto@hotmail.com", phone: "+5532991165007", birthDate: "05/09/1970", totalBRL: 10143.23, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 3044.12, expBRL: 7099.1, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 78884, name: "Luciana Oliveira Kian", registered: "04/08/2025", email: "lucianakian11@gmail.com", phone: "+818036163908", birthDate: "11/11/0984", totalBRL: 90770.65, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 17355.76, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 79048, name: "Farming Solutions ParanavaÍ Ltda", registered: "07/08/2025", email: "marielen.francez@farmingsolutions.net", phone: "+5544998771257", birthDate: "24/09/2024", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 7966, name: "Mocci Obras e Servicos Ltda", registered: "30/11/2023", email: "jmocciterraplanagem@gmail.com", phone: "+5544998403340", birthDate: "09/05/1996", totalBRL: 233482.1, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 44642.85, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 81129, name: "Clayson do Nascimento Andrade", registered: "19/09/2025", email: "claysonandrade@hotmail.com", phone: "+5541999381466", birthDate: "19/02/1976", totalBRL: 16382.75, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 16382.75, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 81527, name: "Rubem Quaresma Barros", registered: "29/09/2025", email: "rubembarros@hotmail.com", phone: "+5561996684177", birthDate: "18/07/1959", totalBRL: 423927.46, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 106954.75, expBRL: 316972.71, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 8157, name: "Carlos Roberto Ruiz", registered: "15/12/2023", email: "carlosrobertoruiz479@gmail.com", phone: "+5544988382936", birthDate: "21/07/1957", totalBRL: 34619.25, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 27602.44, secBRL: 873.34, expBRL: 6143.47, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 81804, name: "Henrique Ramos Pulga", registered: "03/10/2025", email: "henriqueramospulga@gmail.com", phone: "+5544999005648", birthDate: "13/05/1987", totalBRL: 10136.28, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 8.61, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 1938.1, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 82013, name: "Bruna Picoli dos Santos", registered: "09/10/2025", email: "brunapicoli84@gmail.com", phone: "+5544999918941", birthDate: "30/09/1990", totalBRL: 35816.8, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 30045.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.01611833, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 82112, name: "Tiago Santos Costa", registered: "10/10/2025", email: "tiago.scosta_@outlook.com", phone: "+5544988434826", birthDate: "06/03/1990", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 82137, name: "Deny Picoli dos Santos", registered: "12/10/2025", email: "denyspicoli@gmail.com", phone: "+5544999989949", birthDate: "19/06/1988", totalBRL: 72024.94, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 70485.25, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.00429972, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 82660, name: "Gustavo Souza Garcia", registered: "22/10/2025", email: "wtmrgagustavo@gmail.com", phone: "+5543984778518", birthDate: "15/10/1990", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 82910, name: "Bruno Gimenez Santos Lima", registered: "29/10/2025", email: "bruno.gsl@hotmail.com", phone: "+5544991674195", birthDate: "15/04/2025", totalBRL: 21371.81, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 10651.64, expBRL: 10720.17, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 83146, name: "Laedis Sebastião da Cunha", registered: "03/11/2025", email: "laediscunha@hotmail.com", phone: "+5545999562451", birthDate: "08/06/1964", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 83293, name: "Marcos Antonio dos Santos", registered: "06/11/2025", email: "marcosantonio6469@gmail.com", phone: "+5544998498052", birthDate: "11/02/1964", totalBRL: 103576.06, status: "Inativo" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 103576.06, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 84251, name: "Oenning Garcia Invest Holding Ltda", registered: "03/12/2025", email: "holding@escgarcia.com.br", phone: "+5544998570400", birthDate: "16/10/2025", totalBRL: 1868.25, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 1049.2, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.00228728, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 84271, name: "Alison Martins Gomes", registered: "03/12/2025", email: "alisongomes@hotmail.com", phone: "+5544998815703", birthDate: "12/10/1977", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 84336, name: "Paulo Sérgio Madaleno da Silva", registered: "04/12/2025", email: "paulimsms@gmail.com", phone: "+5544997083650", birthDate: "17/08/1990", totalBRL: 10351.35, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 10351.35, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 84598, name: "Santa Costa Chaves Ruiz", registered: "12/12/2025", email: "santaruiz1605@gmail.com", phone: "+5544988277826", birthDate: "16/05/1963", totalBRL: 12449.3, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 5701.5, expBRL: 6747.79, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 85375, name: "Igor dos Santos Palacio", registered: "08/01/2026", email: "igorpalacio94@gmail.com", phone: "+5544997380545", birthDate: "12/01/1994", totalBRL: 15212.9, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 15212.9, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 86003, name: "Ana Claudia Souza Andrade", registered: "27/01/2026", email: "anacsandrade@hotmail.com", phone: "+5545999936096", birthDate: "26/05/1977", totalBRL: 13000.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 13000.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 86373, name: "Fabiano Cardoso Cordeiro", registered: "09/02/2026", email: "fabianocardosocordeiro@gmail.com", phone: "+5544997579114", birthDate: "06/06/1981", totalBRL: 15000.0, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 15000.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 8954, name: "Joao Leonardo Mocci", registered: "23/02/2024", email: "moccileonardo7@gmail.com", phone: "+5544998168033", birthDate: "07/08/1993", totalBRL: 535555.57, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 40000.0, securityBTC: 0.19009414, secBTC: 0.0, securityETH: 25.06624673, secETH: 0.0 },
  { id: 9080, name: "Jonas Batista do Nascimento", registered: "05/03/2024", email: "jonas.bnas@gmail.com", phone: "+5544999870011", birthDate: "30/05/1963", totalBRL: 402314.26, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 19461.23, secUSDT: 0.0, expUSDT: 57463.09, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 9485, name: "Theos Corporativa Ltda", registered: "09/04/2024", email: "financeiro@jeremiasoberherr.com.br", phone: "+5544997154546", birthDate: "25/02/2010", totalBRL: 0.0, status: "Ativado" as const, walletBRL: 1894.85, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 0.0, secBRL: 0.0, expBRL: 0.0, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
  { id: 9972, name: "Bruna Rafaela Ruiz", registered: "06/05/2024", email: "brunatita.sophia@gmail.com", phone: "+5544988356614", birthDate: "13/02/1988", totalBRL: 31092.68, status: "Ativado" as const, walletBRL: 0.0, walletUSDT: 0.0, walletBTC: 0.0, walletETH: 0.0, securityBRL: 0.0, expertBRL: 30181.57, secBRL: 0.0, expBRL: 911.1, securityUSDT: 0.0, expertUSDT: 0.0, secUSDT: 0.0, expUSDT: 0.0, securityBTC: 0.0, secBTC: 0.0, securityETH: 0.0, secETH: 0.0 },
];

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatCrypto(value: number, decimals = 8): string {
  if (value === 0) return "0";
  return value.toFixed(decimals);
}

export function getActiveClients(): Client[] {
  return clients.filter(c => c.status === "Ativado");
}

export function getInactiveClients(): Client[] {
  return clients.filter(c => c.status === "Inativo");
}

export function getClientsWithBalance(): Client[] {
  return clients.filter(c => c.totalBRL > 0);
}

export function getClientsWithoutBalance(): Client[] {
  return clients.filter(c => c.totalBRL === 0 || c.totalBRL === 0.0);
}

export function getTotalAUM(): number {
  return PATRIMONIO_REAL;
}

export function getTotalAUMFromData(): number {
  return clients.reduce((sum, c) => sum + c.totalBRL, 0);
}

export function getTopClients(n = 10): Client[] {
  return [...clients].sort((a, b) => b.totalBRL - a.totalBRL).slice(0, n);
}

export function getProductDistribution() {
  let secBRL = 0, expBRL = 0, securityBRL = 0, expertBRL = 0;
  let securityUSDT = 0, expertUSDT = 0, secUSDT = 0, expUSDT = 0;
  let securityBTC = 0, secBTC = 0, securityETH = 0, secETH = 0;

  clients.forEach(c => {
    secBRL += c.secBRL;
    expBRL += c.expBRL;
    securityBRL += c.securityBRL;
    expertBRL += c.expertBRL;
    securityUSDT += c.securityUSDT;
    expertUSDT += c.expertUSDT;
    secUSDT += c.secUSDT;
    expUSDT += c.expUSDT;
    securityBTC += c.securityBTC;
    secBTC += c.secBTC;
    securityETH += c.securityETH;
    secETH += c.secETH;
  });

  return { secBRL, expBRL, securityBRL, expertBRL, securityUSDT, expertUSDT, secUSDT, expUSDT, securityBTC, secBTC, securityETH, secETH };
}

export function getClientSummary(client: Client) {
  const brlContracts = client.securityBRL + client.expertBRL + client.secBRL + client.expBRL;
  const usdtContracts = client.securityUSDT + client.expertUSDT + client.secUSDT + client.expUSDT;
  const btcHoldings = client.walletBTC + client.securityBTC + client.secBTC;
  const ethHoldings = client.walletETH + client.securityETH + client.secETH;
  const activeProducts: string[] = [];
  
  if (client.secBRL > 0) activeProducts.push("Onil SEC BRL");
  if (client.expBRL > 0) activeProducts.push("Onil EXP BRL");
  if (client.securityBRL > 0) activeProducts.push("Security BRL");
  if (client.expertBRL > 0) activeProducts.push("Expert BRL");
  if (client.securityUSDT > 0) activeProducts.push("Security USDT");
  if (client.expertUSDT > 0) activeProducts.push("Expert USDT");
  if (client.secUSDT > 0) activeProducts.push("SEC USDT");
  if (client.expUSDT > 0) activeProducts.push("EXP USDT");
  if (btcHoldings > 0) activeProducts.push("BTC");
  if (ethHoldings > 0) activeProducts.push("ETH");

  return { brlContracts, usdtContracts, btcHoldings, ethHoldings, activeProducts };
}

// Calcula o valor total em BRL de um cliente incluindo cripto convertido a preço de mercado
export function getClientTotalBRL(client: Client, prices: { BTC: number; ETH: number; USDT: number }) {
  const btcTotal = client.walletBTC + client.securityBTC + client.secBTC;
  const ethTotal = client.walletETH + client.securityETH + client.secETH;
  const usdtTotal = client.walletUSDT + client.securityUSDT + client.expertUSDT + client.secUSDT + client.expUSDT;
  const brlDireto = client.walletBRL + client.securityBRL + client.expertBRL + client.secBRL + client.expBRL;
  
  const btcBRL = btcTotal * prices.BTC;
  const ethBRL = ethTotal * prices.ETH;
  const usdtBRL = usdtTotal * prices.USDT;
  
  return {
    brlDireto,
    btcTotal,
    ethTotal,
    usdtTotal,
    btcBRL,
    ethBRL,
    usdtBRL,
    totalCriptoBRL: btcBRL + ethBRL + usdtBRL,
    patrimonioTotal: brlDireto + btcBRL + ethBRL + usdtBRL,
  };
}

// Calcula o patrimônio total de todos os clientes incluindo cripto
export function getTotalAUMWithCrypto(prices: { BTC: number; ETH: number; USDT: number }): number {
  return clients.reduce((sum, c) => sum + getClientTotalBRL(c, prices).patrimonioTotal, 0);
}

// Retorna os top clientes por patrimônio total (incluindo cripto)
export function getTopClientsWithCrypto(n: number, prices: { BTC: number; ETH: number; USDT: number }) {
  return [...clients]
    .map(c => ({ client: c, ...getClientTotalBRL(c, prices) }))
    .sort((a, b) => b.patrimonioTotal - a.patrimonioTotal)
    .slice(0, n);
}
