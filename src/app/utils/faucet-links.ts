import { Ticker } from 'types/ticker'
import { Network } from '../../types/network'
import { Layer } from '../../oasis-nexus/api'
import { faucets } from './externalLinks'

const faucetLinks: Partial<Record<Network, Partial<Record<Layer, Partial<Record<Ticker, string>>>>>> = {
  [Network.testnet]: {
    [Layer.consensus]: { [Ticker.TEST]: faucets.oasisTestnet },
    [Layer.emerald]: { [Ticker.TEST]: `${faucets.oasisTestnet}?paratime=emerald` },
    [Layer.sapphire]: { [Ticker.TEST]: `${faucets.oasisTestnet}?paratime=sapphire` },
    [Layer.cipher]: { [Ticker.TEST]: `${faucets.oasisTestnet}?paratime=cipher` },
    [Layer.pontusxdev]: {
      [Ticker.EUROe]: `https://portal.pontus-x.eu/faucet`,
    },
    [Layer.pontusxtest]: {
      [Ticker.EUROe]: `https://portal.pontus-x.eu/faucet`,
    },
  },
}

export const getFaucetLink = (network: Network, layer: Layer, ticker: Ticker) =>
  faucetLinks[network]?.[layer]?.[ticker]
