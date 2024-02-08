import { FC } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import FilterNoneIcon from '@mui/icons-material/FilterNone'
import { Runtime, useGetRuntimeStatus } from 'oasis-nexus/api'
import { COLORS } from '../../../styles/theme/colors'
import { StatusIcon } from '../../components/StatusIcon'
import { CardHeaderWithCounter } from '../../components/CardHeaderWithCounter'
import { InlineDescriptionList } from '../../components/StyledDescriptionList'
import { BlockLink } from '../../components/Blocks/BlockLink'
import { RouterLinkCircle } from '../../components/StyledLinks'
import { getLayerLabels } from '../../utils/content'
import { RouteUtils } from '../../utils/route-utils'
import { SearchScope } from '../../../types/searchScope'
import { Network } from '../../../types/network'

const StyledList = styled(InlineDescriptionList)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  'dt, dd': {
    display: 'flex',
    padding: theme.spacing(2, 0),
  },
  dt: {
    alignItems: 'start',
  },
  dd: {
    justifyContent: 'end',
  },
}))

const StyledBox = styled(Box)(() => ({
  border: `2px solid ${COLORS.brandDark}`,
  borderRadius: '12px',
  height: '180px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0px 34px 24px -9px #324DAB1F',
  overflow: 'hidden',
}))

const StyledTypography = styled(Typography)(() => ({
  fontSize: '18px',
  fontWeight: 700,
  color: COLORS.brandDark,
  flex: 1,
  minHeight: '44px',
  display: 'flex',
  alignItems: 'center',
}))

type ParaTimesCardProps = { scope: SearchScope }

export const ParaTimesCard: FC<ParaTimesCardProps> = ({ scope }) => {
  const { t } = useTranslation()
  const { network } = scope
  const enabledRuntimes = RouteUtils.getEnabledRuntimesForNetwork(network)
  const disabledRuntimes = RouteUtils.getDisabledRuntimesForNetwork(network)
  const runtimesNumber = enabledRuntimes.length + disabledRuntimes.length

  return (
    <Card>
      <CardHeader
        disableTypography
        component="h3"
        title={
          <CardHeaderWithCounter
            label={t('paratimes.listTitle')}
            totalCount={runtimesNumber}
            isTotalCountClipped={false}
          />
        }
      />
      <CardContent>
        <Box sx={{ display: 'flex' }}>
          {!!enabledRuntimes.length &&
            enabledRuntimes.map(runtime => (
              <EnabledRuntime key={runtime} network={scope.network} runtime={runtime} />
            ))}
          {!!disabledRuntimes.length &&
            disabledRuntimes.map(runtime => (
              <InactiveRuntime key={runtime} network={scope.network} runtime={runtime} />
            ))}
        </Box>
      </CardContent>
    </Card>
  )
}

type RuntimeProps = {
  network: Network
  runtime: Runtime
}

const EnabledRuntime: FC<RuntimeProps> = ({ network, runtime }) => {
  const query = useGetRuntimeStatus(network, runtime)
  const runtimeStatus = query?.data?.data
  return (
    <RuntimePreview
      network={network}
      runtime={runtime}
      status={{
        activeNodes: runtimeStatus?.active_nodes,
        latestBlock: runtimeStatus?.latest_block,
      }}
    />
  )
}

const InactiveRuntime: FC<RuntimeProps> = ({ network, runtime }) => {
  return <RuntimePreview network={network} runtime={runtime} />
}

type RuntimePreviewProps = RuntimeProps & {
  status?: {
    activeNodes: number | undefined
    latestBlock: number | undefined
  }
}

const RuntimePreview: FC<RuntimePreviewProps> = ({ network, runtime, status }) => {
  const { t } = useTranslation()
  const layerLabels = getLayerLabels(t)
  const runtimeLabel = layerLabels[runtime]
  const dashboardLink = RouteUtils.getDashboardRoute({ network, layer: runtime })

  return (
    <Box sx={{ flex: 1, padding: 3 }}>
      <Box sx={{ marginBottom: 4 }}>
        <StyledTypography>
          {status ? (
            <>
              <Link component={RouterLink} to={dashboardLink}>
                {runtimeLabel}
              </Link>
              <RouterLinkCircle to={dashboardLink} />
            </>
          ) : (
            <>{runtimeLabel}</>
          )}
        </StyledTypography>
      </Box>
      <StyledList>
        <dt>{t('common.status')}:</dt>
        <dd>
          <StatusIcon
            customLabel={status ? t('paratimes.active') : t('paratimes.inactive')}
            success={!!status}
            error={undefined}
            withText
          />
        </dd>
        <dt>{t('paratimes.blockNumber')}</dt>
        <dd>
          {status?.latestBlock ? (
            <BlockLink
              scope={{
                layer: runtime,
                network,
              }}
              height={status.latestBlock}
            />
          ) : (
            '-'
          )}
        </dd>
        <dt>{t('paratimes.nodes')} </dt>
        <dd>{status?.activeNodes ? t('paratimes.activeNodes', { nodes: status?.activeNodes }) : '-'} </dd>
      </StyledList>
      <StyledBox>
        <Box gap={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <FilterNoneIcon sx={{ color: COLORS.brandDark, fontSize: '33px' }} />
          {t('paratimes.noData')}
        </Box>
      </StyledBox>
    </Box>
  )
}
