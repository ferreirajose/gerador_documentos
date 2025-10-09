import { describe, it, expect } from 'vitest'

import {render, screen} from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '@/App'

describe('App', () => {
  it('should render the main title', () => {

    render(<App />)
    
    const title = screen.getByText('Vite + React')
    expect(title).toBeInTheDocument()
  })

})