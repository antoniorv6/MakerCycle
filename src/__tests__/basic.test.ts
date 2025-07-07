describe('Basic Test Suite', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle async operations', async () => {
    const result = await Promise.resolve(42)
    expect(result).toBe(42)
  })

  it('should work with testing library matchers', () => {
    const element = document.createElement('div')
    element.textContent = 'Hello World'
    expect(element).toHaveTextContent('Hello World')
  })
}) 