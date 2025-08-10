import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MediaManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sacred text-[#2F4F3F]">Media Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-[#6B5B73] font-sacred mb-4">
            Media library management interface coming soon...
          </p>
          <p className="text-sm text-[#6B5B73] font-sacred">
            This will include file upload, organization, and media library management.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}