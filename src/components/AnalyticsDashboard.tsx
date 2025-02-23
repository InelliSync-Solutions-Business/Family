import { useState, useEffect } from 'react'
import { BarChart, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Bar } from 'recharts'
import { Card } from './ui/card'
import { useAuth } from '@/hooks/use-auth'

type AnalyticsData = {
  date: string
  searches: number
  uploads: number
  aiInteractions: number
}

export function AnalyticsDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<AnalyticsData[]>([])

  useEffect(() => {
    // TODO: Replace with real analytics API call
    const mockData: AnalyticsData[] = [
      { date: '2025-02-20', searches: 12, uploads: 3, aiInteractions: 24 },
      { date: '2025-02-21', searches: 18, uploads: 5, aiInteractions: 32 },
      { date: '2025-02-22', searches: 15, uploads: 2, aiInteractions: 28 },
    ]
    setData(mockData)
  }, [])

  if (user?.role !== 'admin') return (
    <div className="p-4 text-warm-600">
      Admin privileges required to view analytics
    </div>
  )

  return (
    <div className="space-y-6 p-4">
      <h2 className="font-serif text-xl text-warm-800">Family Archive Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="mb-4 font-medium">Daily Activity</h3>
          <LineChart
            width={500}
            height={300}
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="searches" stroke="#d97706" />
            <Line type="monotone" dataKey="uploads" stroke="#059669" />
            <Line type="monotone" dataKey="aiInteractions" stroke="#2563eb" />
          </LineChart>
        </Card>

        <Card className="p-4">
          <h3 className="mb-4 font-medium">Content Types</h3>
          <BarChart
            width={500}
            height={300}
            data={[
              { name: 'Photos', value: 45 },
              { name: 'Documents', value: 30 },
              { name: 'Letters', value: 25 },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#d97706" />
          </BarChart>
        </Card>
      </div>
    </div>
  )
}
