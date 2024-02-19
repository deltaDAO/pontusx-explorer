import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import ImageListItemBar from '@mui/material/ImageListItemBar'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { LinkableDiv } from '../../components/PageLayout/LinkableDiv'
import { CardEmptyState } from '../../components/CardEmptyState'
import { TokenDashboardContext } from './index'
import { RouteUtils } from '../../utils/route-utils'
import { TablePagination } from '../../components/Table/TablePagination'
import { useTokenInventory } from './hook'
import { ImageListItemImage } from './ImageListItemImage'
import { NFTInstanceLink, NFTOwnerLink } from './NFTLinks'
import { CardHeaderWithCounter } from 'app/components/CardHeaderWithCounter'
import { EvmNft } from 'oasis-nexus/api'
import { To } from 'react-router-dom'
import { SearchScope } from 'types/searchScope'

export const tokenInventoryContainerId = 'inventory'

export const TokenInventoryCard: FC<TokenDashboardContext> = ({ scope, address }) => {
  const { t } = useTranslation()
  const { inventory, isFetched, pagination, totalCount } = useTokenInventory(scope, address)

  return (
    <Card>
      <LinkableDiv id={tokenInventoryContainerId}>
        <CardHeader
          disableTypography
          component="h3"
          title={
            <CardHeaderWithCounter
              label={t('tokens.inventory')}
              totalCount={totalCount}
              isTotalCountClipped={pagination.isTotalCountClipped}
            />
          }
        />
      </LinkableDiv>
      <CardContent>
        <ErrorBoundary light={true}>
          <TokenInventoryView
            inventory={inventory}
            isFetched={isFetched}
            pagination={pagination}
            scope={scope}
            totalCount={totalCount}
          />
        </ErrorBoundary>
      </CardContent>
    </Card>
  )
}

type TokenInventoryViewProps = {
  inventory: EvmNft[] | undefined
  isFetched: boolean
  totalCount: number | undefined
  pagination: {
    isTotalCountClipped: boolean | undefined
    rowsPerPage: number
    selectedPage: number
    linkToPage: (pageNumber: number) => To
  }
  scope: SearchScope
}

const TokenInventoryView: FC<TokenInventoryViewProps> = ({
  inventory,
  isFetched,
  pagination,
  scope,
  totalCount,
}) => {
  const { t } = useTranslation()

  return (
    <>
      {isFetched && !totalCount && <CardEmptyState label={t('tokens.emptyInventory')} />}
      {!!inventory?.length && (
        <>
          <ImageList gap={10}>
            {inventory?.map(instance => {
              const owner = instance?.owner_eth ?? instance?.owner
              const to = RouteUtils.getNFTInstanceRoute(scope, instance.token?.contract_addr, instance.id)
              return (
                <ImageListItem key={instance.id}>
                  <ImageListItemImage instance={instance} to={to} />
                  <ImageListItemBar
                    title={<NFTInstanceLink scope={scope} instance={instance} />}
                    subtitle={owner ? <NFTOwnerLink scope={scope} owner={owner} /> : undefined}
                    position="below"
                  />
                </ImageListItem>
              )
            })}
          </ImageList>
          {pagination && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <TablePagination {...pagination} totalCount={totalCount} />
            </Box>
          )}
        </>
      )}
    </>
  )
}
