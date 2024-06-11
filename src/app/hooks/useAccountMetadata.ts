import { SearchScope } from '../../types/searchScope'
import { Layer } from '../../oasis-nexus/api'
import { usePontusXAccountMetadata, useSearchForPontusXAccountsByName } from '../data/pontusx-account-names'
import { AccountMetadataInfo, AccountNameSearchResults } from '../data/named-accounts'
import { useOasisAccountMetadata, useSearchForOasisAccountsByName } from '../data/oasis-account-names'
import { getOasisAddress } from '../utils/helpers'

/**
 * Find out the metadata for an account
 *
 * This is the entry point that should be used by the application,
 * since this function also includes caching.
 */
export const useAccountMetadata = (scope: SearchScope, address: string): AccountMetadataInfo => {
  const isPontusX = scope.layer === Layer.pontusx || scope.layer === Layer.pontusxdev
  const pontusXData = usePontusXAccountMetadata(address, { enabled: isPontusX })
  const oasisData = useOasisAccountMetadata(scope.network, scope.layer, getOasisAddress(address), {
    enabled: !isPontusX,
  })
  return isPontusX ? pontusXData : oasisData
}

export const useSearchForAccountsByName = (
  scope: SearchScope,
  nameFragment = '',
): AccountNameSearchResults => {
  const isPontusX = scope.layer === Layer.pontusx || scope.layer === Layer.pontusxdev
  const isValidPontusXSearch = isPontusX && !!nameFragment
  const pontusXResults = useSearchForPontusXAccountsByName(scope.network, nameFragment, {
    enabled: isValidPontusXSearch,
  })
  const isValidOasisSearch = !isPontusX && !!nameFragment
  const oasisResults = useSearchForOasisAccountsByName(scope.network, scope.layer, nameFragment, {
    enabled: isValidOasisSearch,
  })
  return {
    isLoading:
      (isValidPontusXSearch && pontusXResults.isLoading) || (isValidOasisSearch && oasisResults.isLoading),
    isError: (isValidPontusXSearch && pontusXResults.isError) || (isValidOasisSearch && oasisResults.isError),
    results: [...(pontusXResults.results ?? []), ...(oasisResults.results ?? [])],
  }
}
