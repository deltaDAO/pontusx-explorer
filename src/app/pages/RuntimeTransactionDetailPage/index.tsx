import { FC } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Layer, RuntimeTransaction, useGetRuntimeTransactionsTxHash } from '../../../oasis-nexus/api'
import { StyledDescriptionList } from '../../components/StyledDescriptionList'
import { PageLayout } from '../../components/PageLayout'
import { SubPageCard } from '../../components/SubPageCard'
import { StatusIcon } from '../../components/StatusIcon'
import { RuntimeTransactionMethod } from '../../components/RuntimeTransactionMethod'
import { useFormattedTimestampStringWithDistance } from '../../hooks/useFormattedTimestamp'
import { useScreenSize } from '../../hooks/useScreensize'
import { AccountLink } from '../../components/Account/AccountLink'
import { CopyToClipboard } from '../../components/CopyToClipboard'
import { AppErrors } from '../../../types/errors'
import { TextSkeleton } from '../../components/Skeleton'
import { BlockLink } from '../../components/Blocks/BlockLink'
import { TransactionLink } from '../../components/Transactions/TransactionLink'
import { RuntimeTransactionEvents } from '../../components/Transactions/RuntimeTransactionEvents'
import { useRequiredScopeParam } from '../../hooks/useScopeParam'
import { DashboardLink } from '../ParatimeDashboardPage/DashboardLink'
import { AllTokenPrices, useAllTokenPrices } from '../../../coin-gecko/api'
import { CurrentFiatValue } from '../../components/CurrentFiatValue'
import { TransactionEncryptionStatus } from '../../components/TransactionEncryptionStatus'
import Typography from '@mui/material/Typography'
import { LongDataDisplay } from '../../components/LongDataDisplay'
import { getPreciseNumberFormat } from '../../../locales/getPreciseNumberFormat'
import { base64ToHex } from '../../utils/helpers'
import { DappBanner } from '../../components/DappBanner'
import { getFiatCurrencyForScope, showFiatValues } from '../../../config'
import { convertToNano, getGasPrice } from '../../utils/number-utils'
import { useWantedTransaction } from '../../hooks/useWantedTransaction'
import { MultipleTransactionsWarning } from '../../components/Transactions/MultipleTransactionsWarning'

export const RuntimeTransactionDetailPage: FC = () => {
  const { t } = useTranslation()

  const scope = useRequiredScopeParam()
  // Consensus is not yet enabled in ENABLED_LAYERS, just some preparation
  if (scope.layer === Layer.consensus) {
    throw AppErrors.UnsupportedLayer
    // Displaying consensus transactions is not yet implemented.
    // we should call useGetConsensusTransactionsTxHash()
  }

  const hash = useParams().hash!

  const { isLoading, data } = useGetRuntimeTransactionsTxHash(
    scope.network,
    scope.layer, // This is OK since consensus has been handled separately
    hash,
  )

  const { wantedTransaction: transaction, warningMultipleTransactionsSameHash } = useWantedTransaction(
    data?.data,
  )

  const tokenPrices = useAllTokenPrices(getFiatCurrencyForScope(scope))

  if (!transaction && !isLoading) {
    throw AppErrors.NotFoundTxHash
  }
  return (
    <PageLayout>
      <MultipleTransactionsWarning enable={warningMultipleTransactionsSameHash} />
      <SubPageCard featured title={t('transaction.header')} mainTitle>
        <RuntimeTransactionDetailView
          isLoading={isLoading}
          transaction={transaction}
          tokenPrices={tokenPrices}
        />
      </SubPageCard>
      <DappBanner scope={scope} ethAddress={transaction?.sender_0_eth} />
      <DappBanner scope={scope} ethAddress={transaction?.to_eth} />
      {transaction && (
        <SubPageCard title={t('common.events')}>
          <RuntimeTransactionEvents transaction={transaction} />
        </SubPageCard>
      )}
    </PageLayout>
  )
}

export type TransactionDetailRuntimeBlock = RuntimeTransaction & {
  markAsNew?: boolean
}

export const RuntimeTransactionDetailView: FC<{
  isLoading?: boolean
  transaction: TransactionDetailRuntimeBlock | undefined
  showLayer?: boolean
  standalone?: boolean
  tokenPrices: AllTokenPrices
}> = ({ isLoading, transaction, showLayer, standalone = false, tokenPrices }) => {
  const { t } = useTranslation()
  const { isMobile } = useScreenSize()
  const formattedTimestamp = useFormattedTimestampStringWithDistance(transaction?.timestamp)
  // @ts-expect-error Ignore index type error
  const amountSymbolPriceInfo = tokenPrices[transaction?.amount_symbol]
  const gasPrice = getGasPrice({ fee: transaction?.charged_fee, gasUsed: transaction?.gas_used.toString() })

  return (
    <>
      {isLoading && <TextSkeleton numberOfRows={10} />}
      {transaction && (
        <StyledDescriptionList
          titleWidth={isMobile ? '100px' : '200px'}
          standalone={standalone}
          highlight={transaction.markAsNew}
        >
          {showLayer && (
            <>
              <dt>{t('common.paratime')}</dt>
              <dd>
                <DashboardLink scope={transaction} />
              </dd>
            </>
          )}

          {(transaction?.hash || transaction?.eth_hash) && (
            <>
              <dt>{t('common.hash')}</dt>
              <dd>
                <TransactionLink
                  scope={transaction}
                  hash={(transaction?.eth_hash || transaction?.hash) as string}
                />
                <CopyToClipboard value={transaction?.eth_hash || transaction?.hash} />
              </dd>
            </>
          )}

          <dt>{t('common.status')}</dt>
          <dd style={{ flexWrap: 'wrap', gap: '10px' }}>
            <StatusIcon success={transaction.success} error={transaction.error} withText={true} />
          </dd>

          <dt>{t('common.block')}</dt>
          <dd>
            <BlockLink scope={transaction} height={transaction.round} />
          </dd>

          <dt>{t('common.type')}</dt>
          <dd>
            <RuntimeTransactionMethod transaction={transaction} />
          </dd>

          <dt>{t('transactions.encryption.format')}</dt>
          <dd>
            <TransactionEncryptionStatus envelope={transaction.encryption_envelope} withText={true} />
          </dd>

          <dt>{t('common.timestamp')}</dt>
          <dd>{formattedTimestamp}</dd>

          {(transaction?.sender_0 || transaction?.sender_0_eth) && (
            <>
              <dt>{t('common.from')}</dt>
              <dd>
                <AccountLink
                  scope={transaction}
                  address={(transaction?.sender_0_eth ?? transaction?.sender_0) as string}
                />
                <CopyToClipboard value={transaction?.sender_0_eth ?? transaction?.sender_0} />
              </dd>
            </>
          )}

          {(transaction?.to || transaction?.to_eth) && (
            <>
              <dt>{t('common.to')}</dt>
              <dd>
                <AccountLink
                  scope={transaction}
                  address={(transaction?.to_eth || transaction?.to) as string}
                />
                <CopyToClipboard value={(transaction?.to_eth || transaction?.to) as string} />
              </dd>
            </>
          )}

          <dt>{t('common.amount')}</dt>
          <dd>
            {transaction.amount != null
              ? t('common.valueInToken', {
                  ...getPreciseNumberFormat(transaction.amount),
                  ticker: transaction.amount_symbol,
                })
              : t('common.missing')}
          </dd>

          {showFiatValues &&
            transaction.amount !== undefined &&
            !!amountSymbolPriceInfo &&
            !amountSymbolPriceInfo.isLoading &&
            !amountSymbolPriceInfo.isFree &&
            amountSymbolPriceInfo.price !== undefined && (
              <>
                <dt>{t('currentFiatValue.title')}</dt>
                <dd>
                  <CurrentFiatValue amount={transaction.amount} {...amountSymbolPriceInfo} />
                </dd>
              </>
            )}

          <dt>{t('common.fee')}</dt>
          <dd>
            {t('common.valueInToken', {
              ...getPreciseNumberFormat(transaction.charged_fee),
              ticker: transaction.fee_symbol,
            })}
          </dd>

          {gasPrice && (
            <>
              <dt>{t('common.gasPrice')}</dt>
              <dd>
                {t('common.valueInToken', {
                  ...getPreciseNumberFormat(convertToNano(gasPrice)),
                  ticker: `n${transaction.fee_symbol}`,
                })}
              </dd>
            </>
          )}

          <dt>{t('common.gasUsed')}</dt>
          <dd>{transaction.gas_used.toLocaleString()}</dd>

          <dt>{t('common.gasLimit')}</dt>
          <dd>{transaction.gas_limit.toLocaleString()}</dd>

          {!!transaction.body?.data && (
            <>
              <dt>{t('transaction.rawData')}</dt>
              <dd>
                <LongDataDisplay data={base64ToHex(transaction.body.data)} />
              </dd>
            </>
          )}

          {!transaction.encryption_envelope && transaction.body?.init_code && (
            <>
              <dt>{t('transaction.rawData')}</dt>
              <dd>
                <LongDataDisplay data={base64ToHex(transaction.body.init_code)} />
              </dd>
            </>
          )}

          {transaction.encryption_envelope && (
            <>
              {transaction.encryption_envelope.public_key !== undefined && (
                <>
                  <dt>{t('transactions.encryption.publicKey')}</dt>
                  <dd>
                    <Typography variant="mono" sx={{ overflowWrap: 'anywhere' }}>
                      {transaction.encryption_envelope.public_key}
                    </Typography>
                  </dd>
                </>
              )}

              {transaction.encryption_envelope.data_nonce !== undefined && (
                <>
                  <dt>{t('transactions.encryption.dataNonce')}</dt>
                  <dd>
                    <Typography variant="mono" sx={{ overflowWrap: 'anywhere' }}>
                      {transaction.encryption_envelope.data_nonce}
                    </Typography>
                  </dd>
                </>
              )}

              {transaction.encryption_envelope.data !== undefined && (
                <>
                  <dt>{t('transactions.encryption.encryptedData')}</dt>
                  <dd>
                    <LongDataDisplay data={transaction.encryption_envelope.data} />
                  </dd>
                </>
              )}

              {transaction.encryption_envelope.result_nonce !== undefined && (
                <>
                  <dt>{t('transactions.encryption.resultNonce')}</dt>
                  <dd>
                    <Typography variant="mono" sx={{ fontWeight: 400 }}>
                      {transaction.encryption_envelope.result_nonce}
                    </Typography>
                  </dd>
                </>
              )}

              {transaction.encryption_envelope.result !== undefined && (
                <>
                  <dt>{t('transactions.encryption.encryptedResult')}</dt>
                  <dd>
                    <LongDataDisplay data={transaction.encryption_envelope.result} fontWeight={400} />
                  </dd>
                </>
              )}
            </>
          )}
        </StyledDescriptionList>
      )}
    </>
  )
}
