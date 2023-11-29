import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import ImageListItemBar from '@mui/material/ImageListItemBar'
import Link from '@mui/material/Link'
import { styled } from '@mui/material/styles'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { LinkableDiv } from '../../components/PageLayout/LinkableDiv'
import { CardEmptyState } from '../AccountDetailsPage/CardEmptyState'
import { TokenDashboardContext } from './index'
import { getNftInstanceLabel } from '../../utils/nft'
import { isNftImageUrlValid, processNftImageUrl } from 'app/utils/nft-images'
import { AccountLink } from '../../components/Account/AccountLink'
import { RouteUtils } from '../../utils/route-utils'
import { NoPreview } from '../../components/NoPreview'
import { TablePagination } from '../../components/Table/TablePagination'
import { useTokenInventory } from './hook'

export const tokenInventoryContainerId = 'inventory'
const imageSize = '210px'

const StyledImage = styled('img')({
  maxWidth: imageSize,
  maxHeight: imageSize,
})

export const TokenInventoryCard: FC<TokenDashboardContext> = ({ scope, address }) => {
  const { t } = useTranslation()

  return (
    <Card>
      <LinkableDiv id={tokenInventoryContainerId}>
        <CardHeader disableTypography component="h3" title={t('tokens.inventory')} />
      </LinkableDiv>
      <CardContent>
        <ErrorBoundary light={true}>
          <TokenInventoryView scope={scope} address={address} />
        </ErrorBoundary>
      </CardContent>
    </Card>
  )
}

const TokenInventoryView: FC<TokenDashboardContext> = ({ scope, address }) => {
  const { t } = useTranslation()
  const { inventory, isFetched, pagination, totalCount } = useTokenInventory(scope, address)

  return (
    <>
      {isFetched && !totalCount && <CardEmptyState label={t('tokens.emptyInventory')} />}
      {inventory && (
        <ImageList
          gap={10}
          sx={{
            // default gridTemplateColumns is set by cols prop default number via inline styles
            // and cannot be overridden without !important statement
            gridTemplateColumns: `repeat(auto-fill, minmax(${imageSize}, ${imageSize}))!important`,
          }}
        >
          {inventory?.map(instance => {
            const owner = instance?.owner_eth ?? instance?.owner
            const to = RouteUtils.getNFTInstanceRoute(scope, instance.token?.contract_addr, instance.id)
            return (
              <ImageListItem key={instance.id}>
                <Link component={RouterLink} to={to}>
                  {isNftImageUrlValid(instance.image) ? (
                    <StyledImage
                      src={processNftImageUrl(instance.image)}
                      alt={getNftInstanceLabel(instance)}
                      loading="lazy"
                    />
                  ) : (
                    <NoPreview placeholderSize={imageSize} />
                  )}
                </Link>
                <ImageListItemBar
                  title={
                    <Trans
                      i18nKey="nft.instanceIdLink"
                      t={t}
                      components={{
                        InstanceLink: (
                          <Link component={RouterLink} to={to}>
                            #{instance.id}
                          </Link>
                        ),
                      }}
                    />
                  }
                  subtitle={
                    owner ? <AccountLink scope={scope} address={owner} alwaysTrim={true} /> : undefined
                  }
                  position="below"
                />
              </ImageListItem>
            )
          })}
        </ImageList>
      )}
      {pagination && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <TablePagination {...pagination} totalCount={totalCount} />
        </Box>
      )}
    </>
  )
}
