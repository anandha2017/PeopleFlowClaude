'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  head: {
    firstName: string;
    lastName: string;
    jobTitle: string;
  } | null;
  _count: {
    people: number;
  };
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/departments')
      .then((res) => res.json())
      .then((data) => {
        setDepartments(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching departments:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading departments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
        <p className="text-gray-600 mt-1">Organizational structure and teams</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{departments.length}</div>
                <p className="text-xs text-muted-foreground">Total Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-green-100">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {departments.reduce((sum, d) => sum + d._count.people, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(
                    departments.reduce((sum, d) => sum + d._count.people, 0) /
                      departments.length
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Avg per Department</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <Card key={dept.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{dept.name}</CardTitle>
                <Badge variant="secondary">{dept.code}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {dept.description && (
                <p className="text-sm text-gray-600">{dept.description}</p>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Employees</span>
                  <span className="font-semibold">{dept._count.people}</span>
                </div>

                {dept.head && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-1">Department Head</p>
                    <p className="font-medium text-sm">
                      {dept.head.firstName} {dept.head.lastName}
                    </p>
                    <p className="text-xs text-gray-600">{dept.head.jobTitle}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
