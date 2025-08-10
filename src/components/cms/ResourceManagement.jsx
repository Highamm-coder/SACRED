import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResourceManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sacred text-[#2F4F3F]">Education Resource Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-[#6B5B73] font-sacred mb-4">
            Education resource management interface coming soon...
          </p>
          <p className="text-sm text-[#6B5B73] font-sacred">
            This will include article, video, course, and guide management.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}