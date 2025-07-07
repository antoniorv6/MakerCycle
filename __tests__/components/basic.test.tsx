import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

describe('Basic Component Tests', () => {
  it('should render a simple component', () => {
    const TestComponent = () => (
      <div>
        <h1>Test Title</h1>
        <p>Test content</p>
        <button>Click me</button>
      </div>
    )
    
    render(<TestComponent />)
    
    expect(screen.getByRole('heading')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle user interactions', async () => {
    const user = userEvent.setup()
    
    const TestComponent = () => {
      const [count, setCount] = React.useState(0)
      return (
        <div>
          <span data-testid="count">{count}</span>
          <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
      )
    }
    
    render(<TestComponent />)
    
    const countElement = screen.getByTestId('count')
    const button = screen.getByRole('button')
    
    expect(countElement).toHaveTextContent('0')
    
    await user.click(button)
    
    expect(countElement).toHaveTextContent('1')
  })

  it('should support form elements', () => {
    const TestComponent = () => (
      <form>
        <label htmlFor="name">Name:</label>
        <input id="name" type="text" defaultValue="John Doe" />
        <button type="submit">Submit</button>
      </form>
    )
    
    render(<TestComponent />)
    
    expect(screen.getByLabelText('Name:')).toBeInTheDocument()
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })
}) 