import { FC, ReactNode } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { LinkableDiv } from '../../components/PageLayout/LinkableDiv'

type LinkableCardLayoutProps = {
  children: ReactNode
  containerId: string
  title: string
}
export const LinkableCardLayout: FC<LinkableCardLayoutProps> = ({ children, containerId, title }) => {
  return (
    <Card>
      <LinkableDiv id={containerId}>
        <CardHeader disableTypography component="h3" title={title} />
      </LinkableDiv>
      <CardContent>
        <ErrorBoundary light={true}>{children}</ErrorBoundary>
      </CardContent>
    </Card>
  )
}
