import { FC } from 'react'
import Card from '@mui/material/Card'
import { useAccount } from '../AccountDetailsPage/hook'
import { TextSkeleton } from '../../components/Skeleton'
import { StyledDescriptionList } from '../../components/StyledDescriptionList'
import { useScreenSize } from '../../hooks/useScreensize'
import { useTranslation } from 'react-i18next'
import { AccountLink } from '../../components/Account/AccountLink'
import { CopyToClipboard } from '../../components/CopyToClipboard'
import { VerificationIcon } from '../../components/ContractVerificationIcon'
import CardContent from '@mui/material/CardContent'
import { TokenTypeTag } from '../../components/Tokens/TokenList'
import { SearchScope } from '../../../types/searchScope'
import { TokenLink } from '../../components/Tokens/TokenLink'
import { EvmNft } from 'oasis-nexus/api'

type InstanceDetailsCardProps = {
  nft: EvmNft | undefined
  isFetched: boolean
  isLoading: boolean
  scope: SearchScope
  contractAddress: string
}

export const InstanceDetailsCard: FC<InstanceDetailsCardProps> = ({
  contractAddress,
  isFetched: isNftFetched,
  isLoading: isNftLoading,
  nft,
  scope,
}) => {
  const { t } = useTranslation()
  const { isMobile } = useScreenSize()
  const {
    account,
    isFetched: isAccountFetched,
    isLoading: accountIsLoading,
  } = useAccount(scope, contractAddress)
  const token = nft?.token
  const isLoading = isNftLoading || accountIsLoading
  const isFetched = isNftFetched || isAccountFetched
  const owner = nft?.owner_eth ?? nft?.owner

  return (
    <Card>
      <CardContent>
        {isLoading && <TextSkeleton numberOfRows={7} />}
        {isFetched && account && nft && (
          <StyledDescriptionList titleWidth={isMobile ? '100px' : '200px'}>
            {nft.name && (
              <>
                <dt>{t('common.name')}</dt>
                <dd>{nft.name}</dd>
              </>
            )}
            <dt>{t('nft.instanceTokenId')}</dt>
            <dd>{nft.id}</dd>
            <dt>{t('common.collection')} </dt>
            <dd>
              <TokenLink scope={scope} address={contractAddress} name={token?.name} />
            </dd>
            <dt>{t('common.type')} </dt>
            <dd>
              <TokenTypeTag tokenType={token?.type} />
            </dd>
            {owner && (
              <>
                <dt>{t('nft.owner')}</dt>
                <dd>
                  <AccountLink scope={scope} address={owner} />
                  <CopyToClipboard value={owner} />
                </dd>
              </>
            )}
            {!!nft?.num_transfers && (
              <>
                <dt>{t('common.transfers')}</dt>
                <dd>{nft.num_transfers.toLocaleString()}</dd>
              </>
            )}
            <dt>{t(isMobile ? 'common.smartContract_short' : 'common.smartContract')}</dt>
            <dd>
              <AccountLink scope={account} address={account.address_eth || account.address} />
              <CopyToClipboard value={account.address_eth || account.address} />
            </dd>
            <dt>{t('contract.verification.title')}</dt>
            <dd>
              <VerificationIcon address_eth={token?.eth_contract_addr!} verified={!!token?.is_verified} />
            </dd>
          </StyledDescriptionList>
        )}
      </CardContent>
    </Card>
  )
}
