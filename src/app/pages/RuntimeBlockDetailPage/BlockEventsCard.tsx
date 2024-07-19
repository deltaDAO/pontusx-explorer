import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { Layer, useGetRuntimeEvents } from '../../../oasis-nexus/api'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { AppErrors } from '../../../types/errors'
import { RuntimeEventsDetailedList } from '../../components/RuntimeEvents/RuntimeEventsDetailedList'
import { AddressSwitchOption } from '../../components/AddressSwitch'
import { EmptyState } from '../../components/EmptyState'
import { LinkableDiv } from '../../components/PageLayout/LinkableDiv'
import { RuntimeBlockDetailsContext } from '.'

export const eventsContainerId = 'events'

const EventsList: FC<RuntimeBlockDetailsContext> = ({ scope, blockHeight }) => {
  const { t } = useTranslation()
  if (scope.layer === Layer.consensus) {
    // Loading events for consensus blocks is not yet supported.
    // Should use useGetConsensusEvents()
    throw AppErrors.UnsupportedLayer
  }
  const eventsQuery = useGetRuntimeEvents(scope.network, scope.layer, {
    block: blockHeight,
    // TODO: search for tx_hash = null
    limit: 100, // We want to avoid pagination here, if possible
  })

  const { isLoading, isError, data } = eventsQuery

  const events = data?.data.events

  if (!events?.length && !isLoading) {
    return (
      <EmptyState
        description={t('runtimeEvent.cantFindMatchingEvents')}
        title={t('runtimeEvent.noEvents')}
        light={true}
      />
    )
  }

  return (
    <RuntimeEventsDetailedList
      scope={scope}
      events={events}
      isLoading={isLoading}
      isError={isError}
      addressSwitchOption={AddressSwitchOption.ETH}
    />
  )
}

export const BlockEventsCard: FC<RuntimeBlockDetailsContext> = ({ scope, blockHeight }) => {
  const { t } = useTranslation()

  if (!blockHeight) {
    return null
  }

  return (
    <Card>
      <LinkableDiv id={eventsContainerId}>
        <CardHeader disableTypography component="h3" title={t('common.events')} />
      </LinkableDiv>
      <CardContent>
        <ErrorBoundary light={true}>
          <EventsList scope={scope} blockHeight={blockHeight} />
        </ErrorBoundary>
      </CardContent>
    </Card>
  )
}
