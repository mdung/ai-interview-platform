import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/utils'
import DataTable from '../DataTable'
import { Column } from '../DataTable'

interface TestData {
  id: number
  name: string
  email: string
}

const testData: TestData[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
]

const columns: Column<TestData>[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
]

describe('DataTable Component', () => {
  it('renders table with data', () => {
    render(<DataTable data={testData} columns={columns} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('renders column headers', () => {
    render(<DataTable data={testData} columns={columns} />)
    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    render(<DataTable data={[]} columns={columns} emptyMessage="No data available" />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })
})

