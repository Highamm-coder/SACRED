import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sacred text-[#2F4F3F]">User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-[#6B5B73] font-sacred mb-4">
            User management interface coming soon...
          </p>
          <p className="text-sm text-[#6B5B73] font-sacred">
            This will include user roles, permissions, and account management.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}