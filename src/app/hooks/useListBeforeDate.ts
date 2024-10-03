import { useEffect, useState } from 'react'
import { Layer, useGetRuntimeStatus, useGetStatus } from '../../oasis-nexus/api'
import { AppError, AppErrors } from 'types/errors'
import { SearchScope } from 'types/searchScope'

function addOneSecond(timestamp: string | undefined) {
  if (!timestamp) {
    return undefined
  }
  const date = new Date(timestamp)
  date.setSeconds(date.getSeconds() + 1)
  return date.toISOString()
}

const useListBeforeDate = (
  latestBlockTime: string | undefined,
  offset: number,
  setOffsetAssociatedWithDate: (offset: number) => void,
) => {
  const [beforeDate, setBeforeDate] = useState<string | undefined>(undefined)
  const setBeforeDateFromCollection = (newDate: string | undefined) => {
    const adjustedDate = addOneSecond(newDate)
    // workaround around "before" filter exclusive maximum transaction time.
    if (offset === 0 && beforeDate !== adjustedDate) {
      setBeforeDate(adjustedDate)
    }
  }

  useEffect(() => {
    if (!beforeDate) {
      setBeforeDate(addOneSecond(latestBlockTime))
      setOffsetAssociatedWithDate(offset)
    }
  }, [latestBlockTime, beforeDate, offset, setOffsetAssociatedWithDate])

  return { beforeDate, setBeforeDateFromCollection }
}

export const useRuntimeListBeforeDate = (scope: SearchScope, offset: number) => {
  const [offsetAssociatedWithDate, setOffsetAssociatedWithDate] = useState<number | undefined>(offset)

  if (scope.layer === Layer.consensus) {
    throw new AppError(AppErrors.UnsupportedLayer)
  }

  const { data } = useGetRuntimeStatus(scope.network, scope.layer, {
    query: {
      queryKey: ['runtimeStatus', scope.network, scope.layer, offsetAssociatedWithDate],
    },
  })

  return useListBeforeDate(data?.data.latest_block_time, offset, setOffsetAssociatedWithDate)
}

export const useConsensusListBeforeDate = (scope: SearchScope, offset: number) => {
  const [offsetAssociatedWithDate, setOffsetAssociatedWithDate] = useState<number | undefined>(offset)
  const { data } = useGetStatus(scope.network, {
    query: {
      queryKey: ['consensusStatus', scope.network, offsetAssociatedWithDate],
    },
  })

  return useListBeforeDate(data?.data.latest_block_time, offset, setOffsetAssociatedWithDate)
}
