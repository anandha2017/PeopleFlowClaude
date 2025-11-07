'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Mail, MapPin, Building2 } from 'lucide-react';
import { getInitials, calculateTenure } from '@/lib/utils';

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  employmentStatus: string;
  startDate: string | null;
  department: { name: string; code: string };
  location: { name: string; code: string };
  manager: { firstName: string; lastName: string } | null;
  directReports: { id: string }[];
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    try {
      const res = await fetch(`/api/people${search ? `?search=${search}` : ''}`);
      const data = await res.json();
      setPeople(data);
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchPeople();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      ACTIVE: 'success',
      ONBOARDING: 'warning',
      LEAVE: 'secondary',
      OFFBOARDING: 'destructive',
    };
    return variants[status] || 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading people...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">People</h1>
          <p className="text-gray-600 mt-1">Manage your organization's employees</p>
        </div>
        <Link href="/people/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Person
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or job title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{people.length}</div>
            <p className="text-xs text-muted-foreground">Total Employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {people.filter((p) => p.employmentStatus === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {people.filter((p) => p.directReports.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Managers</p>
          </CardContent>
        </Card>
      </div>

      {/* People List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {people.map((person) => (
          <Link key={person.id} href={`/people/${person.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {getInitials(person.firstName, person.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {person.firstName} {person.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">{person.jobTitle}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-xs text-gray-500">
                        <Building2 className="mr-1 h-3 w-3" />
                        {person.department.name}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="mr-1 h-3 w-3" />
                        {person.location.name}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Mail className="mr-1 h-3 w-3" />
                        <span className="truncate">{person.email}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant={getStatusBadge(person.employmentStatus)}>
                        {person.employmentStatus}
                      </Badge>
                      {person.startDate && (
                        <span className="text-xs text-gray-500">
                          {calculateTenure(person.startDate)}
                        </span>
                      )}
                    </div>
                    {person.manager && (
                      <p className="text-xs text-gray-500 mt-2">
                        Reports to: {person.manager.firstName} {person.manager.lastName}
                      </p>
                    )}
                    {person.directReports.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {person.directReports.length} direct report{person.directReports.length !== 1 && 's'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {people.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-gray-500">No people found</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
