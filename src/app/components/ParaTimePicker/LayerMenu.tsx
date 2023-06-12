import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import { COLORS } from '../../../styles/theme/colors'
import { Layer } from '../../../oasis-indexer/api'
import { getLayerLabels } from '../../utils/content'
import { RouteUtils } from '../../utils/route-utils'
import { Network } from '../../../types/network'
import { orderByLayer } from '../../../types/layers'

type BaseLayerMenuItemProps = {
  divider: boolean
  layer: Layer
}

export const DisabledLayerMenuItem: FC<BaseLayerMenuItemProps> = ({ divider, layer }) => {
  const { t } = useTranslation()
  const labels = getLayerLabels(t)

  return (
    <Tooltip arrow placement="top" title={'Coming soon'}>
      {/* Div is needed because we need an element with enabled pointer-events to make Tooltip work */}
      <div>
        <MenuItem disabled divider={divider}>
          <ListItemText>{labels[layer]}</ListItemText>
        </MenuItem>
      </div>
    </Tooltip>
  )
}

type LayerMenuItemProps = LayerMenuProps &
  BaseLayerMenuItemProps & {
    hoveredLayer?: Layer
    setHoveredLayer: (layer?: Layer) => void
  }

export const LayerMenuItem: FC<LayerMenuItemProps> = ({
  activeLayer,
  divider,
  layer,
  network,
  selectedLayer,
  selectedNetwork,
  setHoveredLayer,
  setSelectedLayer,
}) => {
  const { t } = useTranslation()
  const labels = getLayerLabels(t)
  const activeLayerSelection = layer === activeLayer && network === selectedNetwork

  return (
    <MenuItem
      divider={divider}
      onMouseEnter={() => {
        setHoveredLayer(layer)
      }}
      onMouseLeave={() => {
        setHoveredLayer()
      }}
      onClick={() => {
        setSelectedLayer(layer)
      }}
      selected={activeLayerSelection}
    >
      <ListItemText>
        {labels[layer]}
        <Typography
          component="span"
          sx={{ fontSize: '10px', fontStyle: 'italic', color: COLORS.grayMedium, ml: 2 }}
        >
          {selectedNetwork === network && activeLayer === layer && t('paraTimePicker.selected')}
        </Typography>
      </ListItemText>
      {layer === selectedLayer && <KeyboardArrowRightIcon />}
    </MenuItem>
  )
}
type LayerMenuProps = {
  activeLayer: Layer
  network: Network
  selectedLayer?: Layer
  selectedNetwork: Network
  setSelectedLayer: (layer: Layer) => void
}

export const LayerMenu: FC<LayerMenuProps> = ({
  activeLayer,
  network,
  selectedLayer,
  selectedNetwork,
  setSelectedLayer,
}) => {
  const [hoveredLayer, setHoveredLayer] = useState<undefined | Layer>()
  const options = Object.values(Layer)
    .map(layer => ({
      layer,
      enabled: RouteUtils.getEnabledLayersForNetwork(selectedNetwork || network).includes(layer),
    }))
    .sort(orderByLayer)

  return (
    <MenuList>
      {options.map((option, index) => {
        if (!option.enabled) {
          return (
            <DisabledLayerMenuItem
              divider={index !== options.length - 1}
              key={option.layer}
              layer={option.layer}
            />
          )
        } else {
          return (
            <LayerMenuItem
              activeLayer={activeLayer}
              divider={index !== options.length - 1}
              hoveredLayer={hoveredLayer}
              key={option.layer}
              layer={option.layer}
              network={network}
              selectedLayer={selectedLayer}
              selectedNetwork={selectedNetwork}
              setHoveredLayer={setHoveredLayer}
              setSelectedLayer={setSelectedLayer}
            />
          )
        }
      })}
    </MenuList>
  )
}