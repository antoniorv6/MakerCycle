import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('App Configuration', () => {
  it('should have testing library configured correctly', () => {
    const TestComponent = () => <div data-testid="test">Hello World</div>
    
    render(<TestComponent />)
    
    expect(screen.getByTestId('test')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should support jest-dom matchers', () => {
    const TestComponent = () => (
      <div>
        <button disabled>Disabled Button</button>
        <input defaultValue="test value" />
      </div>
    )
    
    render(<TestComponent />)
    
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveValue('test value')
  })
}) 