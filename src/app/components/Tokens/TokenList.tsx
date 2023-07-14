import { useTranslation } from 'react-i18next'
import { EvmToken, EvmTokenType } from '../../../oasis-nexus/api'
import { Table, TableCellAlign, TableColProps } from '../../components/Table'
import { TablePaginationProps } from '../Table/TablePagination'
import { AccountLink } from '../Account/AccountLink'
import { TokenLink } from './TokenLink'
import { CopyToClipboard } from '../CopyToClipboard'
import { DelayedContractVerificationIcon, verificationIconBoxHeight } from '../ContractVerificationIcon'
import Box from '@mui/material/Box'
import {
  getTokenTypeDescription,
  getTokenTypeStrictName,
  tokenBackgroundColor,
  tokenBorderColor,
} from '../../../types/tokens'
import { FC } from 'react'
import Typography from '@mui/material/Typography'
import { COLORS } from '../../../styles/theme/colors'
import { SxProps } from '@mui/material/styles'
import { RoundedBalance } from '../RoundedBalance'

type TokensProps = {
  tokens?: EvmToken[]
  isLoading: boolean
  limit: number
  pagination: false | TablePaginationProps
}

export const TokenTypeTag: FC<{ tokenType: EvmTokenType; sx?: SxProps }> = ({ tokenType, sx = {} }) => {
  const { t } = useTranslation()
  return (
    <Box
      sx={{
        background: tokenBackgroundColor[tokenType],
        border: `1px solid ${tokenBorderColor[tokenType]}`,
        display: 'inline-block',
        borderRadius: 2,
        py: 1,
        px: 3,
        fontSize: 12,
        height: verificationIconBoxHeight,
        verticalAlign: 'middle',
        textAlign: 'center',
        ...sx,
      }}
    >
      <Typography component="span">{getTokenTypeDescription(t, tokenType)}</Typography>
      &nbsp;
      <Typography component="span" color={COLORS.grayMedium}>
        {t('common.parentheses', { subject: getTokenTypeStrictName(t, tokenType) })}
      </Typography>
    </Box>
  )
}

export const TokenList = (props: TokensProps) => {
  const { isLoading, tokens, pagination, limit } = props
  const { t } = useTranslation()
  const tableColumns: TableColProps[] = [
    { key: 'index', content: '' },
    { key: 'name', content: t('common.name') },
    { key: 'type', content: t('common.type') },
    { key: 'contract', content: t('common.smartContract') },
    { key: 'verification', content: t('contract.verification.title') },
    {
      key: 'holders',
      content: t('tokens.holdersCount'),
      align: TableCellAlign.Right,
    },
    { key: 'supply', content: t('tokens.totalSupply'), align: TableCellAlign.Right },
    { key: 'ticker', content: t('common.ticker'), align: TableCellAlign.Right },
  ]

  const tableRows = tokens?.map((token, index) => {
    return {
      key: token.contract_addr,
      data: [
        {
          content: (
            (pagination ? (pagination.selectedPage - 1) * pagination.rowsPerPage : 0) +
            index +
            1
          ).toLocaleString(),
          key: 'index',
        },
        {
          content: (
            <TokenLink
              scope={token}
              address={token.eth_contract_addr ?? token.contract_addr}
              name={token.name}
            />
          ),
          key: 'name',
        },
        {
          key: 'type',
          content: <TokenTypeTag tokenType={token.type} sx={{ width: '100%' }} />,
        },
        {
          content: (
            <span>
              <AccountLink scope={token} address={token.eth_contract_addr ?? token.contract_addr} />
              <CopyToClipboard value={token.eth_contract_addr ?? token.contract_addr} />
            </span>
          ),
          key: 'contactAddress',
        },
        {
          key: 'verification',
          content: (
            <Box
              sx={{
                display: 'inline-flex',
                verticalAlign: 'middle',
                width: '100%',
              }}
            >
              <DelayedContractVerificationIcon
                scope={token}
                contractOasisAddress={token.contract_addr}
                noLink
              />
            </Box>
          ),
        },
        {
          content: token.num_holders.toLocaleString(),
          key: 'holdersCount',
          align: TableCellAlign.Right,
        },
        {
          content: <RoundedBalance compactLargeNumbers value={token.total_supply} ticker={token.symbol} />,
          key: 'supply',
          align: TableCellAlign.Right,
        },
        {
          content: token.symbol,
          key: 'ticker',
          align: TableCellAlign.Right,
        },
      ],
    }
  })

  return (
    <Table
      columns={tableColumns}
      rows={tableRows}
      rowsNumber={limit}
      name={t('common.tokens')}
      isLoading={isLoading}
      pagination={pagination}
    />
  )
}
