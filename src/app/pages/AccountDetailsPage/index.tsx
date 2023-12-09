import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHref, useLoaderData, useOutletContext } from 'react-router-dom'
import { PageLayout } from '../../components/PageLayout'
import { RouterTabs } from '../../components/RouterTabs'
import { useTokenPrice } from '../../../coin-gecko/api'
import { Ticker } from '../../../types/ticker'

import { EvmTokenType, RuntimeAccount } from '../../../oasis-nexus/api'
import { accountTokenContainerId } from './AccountTokensCard'
import { useAccount, useAccountEvents } from './hook'
import { useRequiredScopeParam } from '../../hooks/useScopeParam'
import { contractCodeContainerId } from './ContractCodeCard'
import { useTokenInfo } from '../TokenDashboardPage/hook'
import { accountTokenTransfersContainerId } from './AccountTokenTransfersCard'
import { getTokenTypePluralName } from '../../../types/tokens'
import { SearchScope } from '../../../types/searchScope'
import { AccountDetailsCard } from './AccountDetailsCard'
import { AccountEventsCard } from './AccountEventsCard'
import { EventFilterMode } from '../../components/RuntimeEvents/EventListFilterSwitch'
import { DappBanner } from '../../components/DappBanner'

export type AccountDetailsContext = {
  scope: SearchScope
  address: string
  account?: RuntimeAccount
}

export const useAccountDetailsProps = () => useOutletContext<AccountDetailsContext>()

export const AccountDetailsPage: FC = () => {
  const { t } = useTranslation()

  const scope = useRequiredScopeParam()
  const address = useLoaderData() as string
  const { account, isLoading: isAccountLoading, isError } = useAccount(scope, address)
  const isContract = !!account?.evm_contract
  const { token, isLoading: isTokenLoading } = useTokenInfo(scope, address, isContract)

  const tokenPriceInfo = useTokenPrice(account?.ticker || Ticker.ROSE)
  const [eventFilterMode, setEventFilterMode] = useState<EventFilterMode>(EventFilterMode.All)

  const {
    isLoading: areEventsLoading,
    isError: isEventsError,
    events,
  } = useAccountEvents(scope, address, eventFilterMode)

  const tokenTransfersLink = useHref(`token-transfers#${accountTokenTransfersContainerId}`)
  const erc20Link = useHref(`tokens/erc-20#${accountTokenContainerId}`)
  const erc721Link = useHref(`tokens/erc-721#${accountTokenContainerId}`)

  const txLink = useHref('')
  const showCode = isContract
  const codeLink = useHref(`code#${contractCodeContainerId}`)

  const isLoading = isAccountLoading || isTokenLoading

  const context: AccountDetailsContext = { scope, address, account }

  return (
    <PageLayout>
      <AccountDetailsCard
        isLoading={isLoading}
        isError={isError}
        isContract={isContract}
        account={account}
        token={token}
        tokenPriceInfo={tokenPriceInfo}
      />
      <DappBanner scope={scope} ethAddress={account?.address_eth} />
      <RouterTabs
        tabs={[
          { label: t('common.transactions'), to: txLink },
          { label: t('tokens.transfers'), to: tokenTransfersLink },
          {
            label: getTokenTypePluralName(t, EvmTokenType.ERC20),
            to: erc20Link,
          },
          {
            label: getTokenTypePluralName(t, EvmTokenType.ERC721),
            to: erc721Link,
          },
          { label: t('contract.code'), to: codeLink, visible: showCode },
        ]}
        context={context}
      />
      <AccountEventsCard
        scope={scope}
        filterMode={eventFilterMode}
        setFilterMode={setEventFilterMode}
        isLoading={areEventsLoading}
        isError={isEventsError}
        events={events}
      />
    </PageLayout>
  )
}
