import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import './Charts.css'

export interface ChartData {
  name: string
  value: number
  [key: string]: string | number
}

export interface LineChartProps {
  data: ChartData[]
  dataKeys: string[]
  xAxisKey?: string
  colors?: string[]
  title?: string
  height?: number
}

export interface BarChartProps {
  data: ChartData[]
  dataKeys: string[]
  xAxisKey?: string
  colors?: string[]
  title?: string
  height?: number
}

export interface PieChartProps {
  data: ChartData[]
  dataKey?: string
  nameKey?: string
  colors?: string[]
  title?: string
  height?: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export const LineChartComponent = ({
  data,
  dataKeys,
  xAxisKey = 'name',
  colors = COLORS,
  title,
  height = 300
}: LineChartProps) => {
  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export const BarChartComponent = ({
  data,
  dataKeys,
  xAxisKey = 'name',
  colors = COLORS,
  title,
  height = 300
}: BarChartProps) => {
  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export const PieChartComponent = ({
  data,
  dataKey = 'value',
  nameKey = 'name',
  colors = COLORS,
  title,
  height = 300
}: PieChartProps) => {
  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}


