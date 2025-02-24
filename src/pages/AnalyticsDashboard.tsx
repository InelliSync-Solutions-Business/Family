import { useState } from 'react'
import { Card } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import { useAuth } from '@/hooks/use-auth'

interface StorageStats {
  used: number
  total: number
  files: {
    images: number
    documents: number
    audio: number
    video: number
  }
}

interface ActivityStats {
  uploads: number
  shares: number
  comments: number
  lastActive: string
}

export function AnalyticsDashboard() {
  const { user } = useAuth()
  const [storageStats] = useState<StorageStats>({
    used: 2.5,
    total: 10,
    files: {
      images: 150,
      documents: 45,
      audio: 12,
      video: 8
    }
  })

  const [activityStats] = useState<ActivityStats>({
    uploads: 215,
    shares: 48,
    comments: 156,
    lastActive: '2025-02-23'
  })

  const usagePercentage = (storageStats.used / storageStats.total) * 100

  return (
    <div className="container py-8 space-y-8">
      <h1 className="font-serif text-2xl text-warm-800">Analytics Dashboard</h1>

      {/* Storage Usage */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Storage Usage</h2>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>{storageStats.used}GB used</span>
            <span>{storageStats.total}GB total</span>
          </div>
          <Progress value={usagePercentage} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card className="p-4">
            <div className="text-2xl font-bold">{storageStats.files.images}</div>
            <div className="text-sm text-warm-600">Images</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">{storageStats.files.documents}</div>
            <div className="text-sm text-warm-600">Documents</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">{storageStats.files.audio}</div>
            <div className="text-sm text-warm-600">Audio Files</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">{storageStats.files.video}</div>
            <div className="text-sm text-warm-600">Videos</div>
          </Card>
        </div>
      </Card>

      {/* Activity Stats */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Activity Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold">{activityStats.uploads}</div>
            <div className="text-sm text-warm-600">Total Uploads</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{activityStats.shares}</div>
            <div className="text-sm text-warm-600">Shared Items</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{activityStats.comments}</div>
            <div className="text-sm text-warm-600">Comments</div>
          </div>
          <div>
            <div className="text-sm text-warm-600">Last Active</div>
            <div>{new Date(activityStats.lastActive).toLocaleDateString()}</div>
          </div>
        </div>
      </Card>

      {/* Family Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Family Activity</h2>
        <p className="text-warm-600">
          Coming soon: Track your family's engagement and interactions with shared memories.
        </p>
      </Card>
    </div>
  )
}
