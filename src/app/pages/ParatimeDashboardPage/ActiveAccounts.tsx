import { FC } from 'react'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import startOfMonth from 'date-fns/startOfMonth'
import { SnapshotCard } from '../../components/Snapshots/SnapshotCard'
import { SnapshotCardDurationLabel } from '../../components/Snapshots/SnapshotCardDurationLabel'
import { BarChart } from '../../components/charts/BarChart'
import {
  useGetLayerStatsActiveAccounts,
  GetLayerStatsActiveAccountsWindowStepSeconds,
  type ActiveAccounts as Windows,
} from '../../../oasis-nexus/api'
import {
  ChartDuration,
  chartUseQueryStaleTimeMs,
  dailyLimitWithoutBuffer,
  durationToQueryParams,
  filterHourlyActiveAccounts,
  sumBucketsByStartDuration,
} from '../../utils/chart-utils'
import { useRequiredScopeParam } from '../../hooks/useScopeParam'

export const getActiveAccountsWindows = (duration: ChartDuration, windows: Windows[]) => {
  switch (duration) {
    case ChartDuration.TODAY:
      return filterHourlyActiveAccounts(windows)
    case ChartDuration.ALL_TIME:
      return sumBucketsByStartDuration(windows, 'active_accounts', 'window_end', startOfMonth)
    default:
      return windows
  }
}

export const getChartLabelFormatParams = (duration: ChartDuration) => {
  switch (duration) {
    case ChartDuration.TODAY:
      return {
        timestamp: {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        } satisfies Intl.DateTimeFormatOptions,
      }
    case ChartDuration.ALL_TIME:
      return {
        timestamp: {
          year: 'numeric',
          month: 'long',
        } satisfies Intl.DateTimeFormatOptions,
      }
    default:
      return undefined
  }
}

type ActiveAccountsProps = {
  chartDuration: ChartDuration
}

const getLabels = (t: TFunction): Record<ChartDuration, string> => ({
  [ChartDuration.TODAY]: t('chartDuration.lastHour'),
  [ChartDuration.WEEK]: t('chartDuration.lastDay'),
  [ChartDuration.MONTH]: t('chartDuration.lastDay'),
  [ChartDuration.ALL_TIME]: t('chartDuration.lastMonth'),
})

export const ActiveAccounts: FC<ActiveAccountsProps> = ({ chartDuration }) => {
  const { t } = useTranslation()
  const labels = getLabels(t)
  const { limit, bucket_size_seconds } = {
    ...durationToQueryParams[chartDuration],
    // By default we fetch data with additional buckets buffer, but it does not apply to active accounts.
    // Active accounts daily buckets are overlapping, so we cannot sum buckets like in other daily charts.
    limit:
      chartDuration === ChartDuration.TODAY
        ? dailyLimitWithoutBuffer
        : durationToQueryParams[chartDuration].limit,
  }
  const scope = useRequiredScopeParam()
  const activeAccountsQuery = useGetLayerStatsActiveAccounts(
    scope.network,
    scope.layer,
    {
      limit,
      window_step_seconds: bucket_size_seconds as GetLayerStatsActiveAccountsWindowStepSeconds,
    },
    {
      query: {
        keepPreviousData: true,
        staleTime: chartUseQueryStaleTimeMs,
      },
    },
  )
  const weeklyChart = activeAccountsQuery.isFetched && chartDuration === ChartDuration.WEEK
  const windows =
    activeAccountsQuery.data?.data?.windows &&
    getActiveAccountsWindows(chartDuration, activeAccountsQuery.data?.data?.windows)

  return (
    <SnapshotCard
      title={t('activeAccounts.title')}
      label={
        <SnapshotCardDurationLabel
          label={labels[chartDuration]}
          value={windows?.length && windows[0].active_accounts}
        />
      }
    >
      {windows && (
        <BarChart
          barSize={!weeklyChart ? 8 : undefined}
          data={windows.slice().reverse()}
          dataKey="active_accounts"
          formatters={{
            data: (value: number) =>
              t('activeAccounts.tooltip', {
                value,
              }),
            label: (value: string) =>
              t('common.formattedDateTime', {
                timestamp: new Date(value),
                formatParams: getChartLabelFormatParams(chartDuration),
              }),
          }}
          withBarBackground
        />
      )}
    </SnapshotCard>
  )
}