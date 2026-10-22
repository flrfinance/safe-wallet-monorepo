import { render, screen } from '@testing-library/react'
import SafeLogo from '../index'
import { AppRoutes } from '@/config/routes'

jest.mock('@/public/images/safe-pro/pro-chip.svg', () => 'svg')

jest.mock('next/link', () => {
  const MockLink = ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
  MockLink.displayName = 'Link'
  return { __esModule: true, default: MockLink }
})

describe('SafeLogo', () => {
  it('renders a link to /welcome/spaces by default', () => {
    render(<SafeLogo />)
    expect(screen.getByRole('link')).toHaveAttribute('href', AppRoutes.welcome.spaces)
  })

  it('renders a link to the provided href', () => {
    render(<SafeLogo href="/welcome" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/welcome')
  })

  it('renders the Safe logo image with alt text and testid', () => {
    render(<SafeLogo />)
    const img = screen.getByTestId('logo-image')
    expect(img).toHaveAttribute('alt', 'Safe')
  })

  it('renders the Home label pill variant with the logo', () => {
    render(<SafeLogo href={AppRoutes.welcome.accounts} showHomeLabel />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', AppRoutes.welcome.accounts)
    expect(link).toHaveTextContent('Home')
    expect(screen.getByTestId('logo-image')).toBeInTheDocument()
  })

  it('renders the logo with the PRO chip in the pill for Workspaces on a plan', () => {
    render(<SafeLogo showHomeLabel showProLockup />)
    expect(screen.getByRole('img', { name: 'Safe Pro' })).toBeInTheDocument()
    expect(screen.getByTestId('logo-image')).toBeInTheDocument()
    expect(screen.getByRole('link')).not.toHaveTextContent('Home')
  })
})

describe('SafeLogo with a custom brand', () => {
  const renderBranded = (isOfficialHost: boolean) => {
    jest.isolateModules(() => {
      jest.doMock('@/config/constants', () => ({
        ...jest.requireActual('@/config/constants'),
        IS_OFFICIAL_HOST: isOfficialHost,
        BRAND_LOGO: '/images/brand.svg',
        BRAND_NAME: 'Brand',
      }))
      const { default: BrandedSafeLogo } = require('../index')
      render(<BrandedSafeLogo />)
    })
  }

  afterEach(() => jest.dontMock('@/config/constants'))

  it('renders the brand logo on non-official hosts', () => {
    renderBranded(false)
    const img = screen.getByTestId('logo-image')
    expect(img).toHaveAttribute('src', '/images/brand.svg')
    expect(img).toHaveAttribute('alt', 'Brand')
  })

  it('keeps the Safe logo on official hosts', () => {
    renderBranded(true)
    expect(screen.getByTestId('logo-image')).toHaveAttribute('alt', 'Safe')
  })
})
