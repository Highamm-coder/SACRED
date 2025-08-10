import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sacred text-[#2F4F3F]">Analytics Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-[#6B5B73] font-sacred mb-4">
            Analytics dashboard coming soon...
          </p>
          <p className="text-sm text-[#6B5B73] font-sacred">
            This will include user analytics, content performance, and platform metrics.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}