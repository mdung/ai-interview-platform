# Common Components

This directory contains reusable UI components for the AI Interview Platform.

## Components

### DataTable
A feature-rich data table with pagination, sorting, and filtering.

```tsx
import { DataTable, Column } from './components'

const columns: Column<YourDataType>[] = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true, filterable: true },
  { key: 'email', header: 'Email', render: (row) => <a href={`mailto:${row.email}`}>{row.email}</a> }
]

<DataTable
  data={yourData}
  columns={columns}
  pageSize={10}
  searchable={true}
  onRowClick={(row) => console.log(row)}
/>
```

### SearchBar
A search input with debounced search functionality.

```tsx
import { SearchBar } from './components'

<SearchBar
  placeholder="Search candidates..."
  onSearch={(value) => handleSearch(value)}
  debounceMs={300}
/>
```

### FilterPanel
A panel for applying multiple filters.

```tsx
import { FilterPanel, Filter } from './components'

const filters: Filter[] = [
  { key: 'status', label: 'Status', type: 'select', options: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ]},
  { key: 'verified', label: 'Verified', type: 'checkbox' }
]

<FilterPanel
  filters={filters}
  onFilterChange={(filters) => handleFilterChange(filters)}
/>
```

### Modal
A flexible modal dialog component.

```tsx
import { Modal } from './components'

const [isOpen, setIsOpen] = useState(false)

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="medium"
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

### Toast Notifications
Toast notifications with a context provider.

```tsx
import { ToastProvider, useToast } from './components'

// Wrap your app with ToastProvider
<ToastProvider>
  <App />
</ToastProvider>

// Use in components
const { showToast } = useToast()

showToast('Operation successful!', 'success')
showToast('An error occurred', 'error')
showToast('Warning message', 'warning')
showToast('Info message', 'info')
```

### FileUpload
File upload with drag-and-drop support.

```tsx
import { FileUpload } from './components'

<FileUpload
  accept=".pdf,.doc,.docx"
  multiple={false}
  maxSize={10}
  onFileSelect={(files) => handleFileSelect(files)}
  onError={(error) => console.error(error)}
/>
```

### AudioPlayer
Audio player component (already exists, enhanced).

```tsx
import { AudioPlayer } from './components'

<AudioPlayer audioUrl="/path/to/audio.mp3" />
// or
<AudioPlayer audioBlob={audioBlob} />
```

### PDFViewer
PDF viewer with zoom controls.

```tsx
import { PDFViewer } from './components'

<PDFViewer
  url="/path/to/document.pdf"
  title="Resume"
  showControls={true}
/>
```

### Charts
Chart components using Recharts.

```tsx
import { LineChartComponent, BarChartComponent, PieChartComponent } from './components'

const data = [
  { name: 'Jan', value: 100, other: 200 },
  { name: 'Feb', value: 150, other: 250 }
]

<LineChartComponent
  data={data}
  dataKeys={['value', 'other']}
  title="Monthly Trends"
/>

<BarChartComponent
  data={data}
  dataKeys={['value']}
  title="Monthly Data"
/>

<PieChartComponent
  data={data}
  dataKey="value"
  title="Distribution"
/>
```

### Calendar
Calendar component for date selection.

```tsx
import { Calendar } from './components'

<Calendar
  selectedDate={selectedDate}
  onDateSelect={(date) => setSelectedDate(date)}
  minDate={new Date()}
/>
```

### DatePicker
Date picker with calendar dropdown.

```tsx
import { DatePicker } from './components'

<DatePicker
  value={selectedDate}
  onChange={(date) => setSelectedDate(date)}
  placeholder="Select date"
  format="YYYY-MM-DD"
/>
```

### DateTimePicker
Date and time picker.

```tsx
import { DateTimePicker } from './components'

<DateTimePicker
  value={selectedDateTime}
  onChange={(date) => setSelectedDateTime(date)}
  showSeconds={false}
/>
```

### ThemeToggle
Toggle between light and dark mode.

```tsx
import { ThemeToggle } from './components'
import { useTheme } from '../contexts/ThemeContext'

<ThemeToggle showLabel={true} />
```

### LanguageSelector
Select application language.

```tsx
import { LanguageSelector } from './components'

<LanguageSelector showLabel={true} />
```

### LoadingSpinner
Loading spinner with different sizes.

```tsx
import { LoadingSpinner } from './components'

<LoadingSpinner size="large" message="Loading data..." />
<LoadingSpinner fullScreen={true} />
```

### Skeleton
Skeleton loading placeholders.

```tsx
import { Skeleton } from './components'

<Skeleton width="100%" height={20} />
<Skeleton variant="circular" width={40} height={40} />
<Skeleton count={5} variant="text" />
```

### ErrorBoundary
Error boundary for catching React errors.

```tsx
import { ErrorBoundary } from './components'

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### ErrorDisplay
Display error messages.

```tsx
import { ErrorDisplay } from './components'

<ErrorDisplay
  error={error}
  title="Failed to load data"
  onRetry={() => refetch()}
  showDetails={true}
/>
```

## Usage Tips

1. **ToastProvider**: Wrap your root component with `ToastProvider` to enable toast notifications throughout your app.

2. **DataTable**: Use the `render` prop in columns for custom cell rendering.

3. **Modal**: Use different sizes (`small`, `medium`, `large`, `fullscreen`) based on your content.

4. **Charts**: All chart components are responsive and use Recharts under the hood.

5. **FileUpload**: Supports drag-and-drop, file validation, and multiple file selection.

6. **Date/Time Pickers**: All date components support min/max date constraints.

7. **Theme**: All components automatically adapt to light/dark theme.

8. **Responsive**: All components are mobile-responsive and work on all screen sizes.

9. **Accessibility**: All components include proper ARIA labels and keyboard navigation support.
