import { FC } from 'react'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import { useScreenSize } from '../../hooks/useScreensize'
import { Social } from '../../components/Social'
import { LearningMaterials } from './LearningMaterials'
import { LatestRuntimeBlocks } from './LatestRuntimeBlocks'
import { LatestRuntimeTransactions } from './LatestRuntimeTransactions'
import { TransactionsStats } from '../../components/TransactionsStats'
import { TotalTransactions } from '../../components/TotalTransactions'
import { PageLayout } from '../../components/PageLayout'
import { ParaTimeSnapshot } from './ParaTimeSnapshot'
import { TopTokens } from './TopTokens'
import { useRequiredScopeParam } from '../../hooks/useScopeParam'
import { paraTimesConfig } from '../../../config'

export const ParatimeDashboardPage: FC = () => {
  const { isMobile } = useScreenSize()
  const scope = useRequiredScopeParam()

  const { hideTokensFromDashboard } = paraTimesConfig[scope.layer]!

  return (
    <PageLayout>
      <ParaTimeSnapshot scope={scope} />
      <Divider variant="layout" sx={{ mt: isMobile ? 4 : 0 }} />
      <LatestRuntimeTransactions scope={scope} />
      <Grid container spacing={4}>
        <Grid item xs={12} md={6} sx={{ display: 'flex', order: isMobile ? 1 : 0 }}>
          <LearningMaterials scope={scope} />
        </Grid>
        <Grid item xs={12} md={6}>
          <LatestRuntimeBlocks scope={scope} />
        </Grid>
        {isMobile && (
          <Grid item xs={12}>
            <TopTokens scope={scope} />
          </Grid>
        )}
      </Grid>
      {!hideTokensFromDashboard && !isMobile && <TopTokens scope={scope} />}
      <TransactionsStats scope={scope} />
      <TotalTransactions scope={scope} />
      <Social />
    </PageLayout>
  )
}
