import { FC } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useScreenSize } from '../../hooks/useScreensize'
import Link from '@mui/material/Link'
import { TrimLinkLabel, TrimEndLinkLabel } from '../TrimLinkLabel'
import { RouteUtils } from '../../utils/route-utils'
import Typography from '@mui/material/Typography'
import { COLORS } from '../../../styles/theme/colors'
import { Network } from '../../../types/network'

type ValidatorLinkProps = {
  address: string
  name?: string
  network: Network
}

export const ValidatorLink: FC<ValidatorLinkProps> = ({ address, name, network }) => {
  const { isTablet } = useScreenSize()
  const to = RouteUtils.getValidatorRoute(network, address)
  return (
    <Typography variant="mono" component="span" sx={{ color: COLORS.brandDark, fontWeight: 700 }}>
      {isTablet ? (
        <TabletValidatorLink address={address} name={name} to={to} />
      ) : (
        <Link component={RouterLink} to={to}>
          {name || address}
        </Link>
      )}
    </Typography>
  )
}

type TrimValidatorEndLinkLabelProps = {
  name: string
  to: string
}

const TrimValidatorEndLinkLabel: FC<TrimValidatorEndLinkLabelProps> = ({ name, to }) => (
  <TrimEndLinkLabel label={name} to={to} trimStart={14} />
)

type TabletValidatorLinkProps = {
  address: string
  name?: string
  to: string
}

const TabletValidatorLink: FC<TabletValidatorLinkProps> = ({ address, name, to }) => {
  if (name) {
    return <TrimValidatorEndLinkLabel name={name} to={to} />
  }
  return <TrimLinkLabel label={address} to={to} />
}
