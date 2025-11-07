'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  User,
  Users,
  Briefcase,
} from 'lucide-react';
import { getInitials, formatDate, calculateTenure } from '@/lib/utils';

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  email: string;
  phone?: string;
  jobTitle: string;
  employmentStatus: string;
  employmentType: string;
  startDate: string | null;
  endDate: string | null;
  fullTimeEquivalent: number;
  department: { name: string; code: string };
  location: { name: string; code: string; city: string; country: string };
  manager: { id: string; firstName: string; lastName: string; jobTitle: string } | null;
  directReports: Array<{
    id: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    email: string;
  }>;
  skills: string[];
  bio?: string;
}

export default function PersonDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerson();
  }, [params.id]);

  const fetchPerson = async () => {
    try {
      const res = await fetch(`/api/people/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setPerson(data);
      } else {
        router.push('/people');
      }
    } catch (error) {
      console.error('Error fetching person:', error);
    } finally {
      setLoading(false);
    }
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
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!person) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/people">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {person.firstName} {person.lastName}
            </h1>
            <p className="text-gray-600 mt-1">{person.jobTitle}</p>
          </div>
        </div>
        <Link href={`/people/${person.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Profile */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-3xl">
                    {getInitials(person.firstName, person.lastName)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="text-center">
                <h3 className="font-semibold text-lg">
                  {person.firstName} {person.lastName}
                </h3>
                {person.preferredName && (
                  <p className="text-sm text-gray-500">({person.preferredName})</p>
                )}
                <Badge variant={getStatusBadge(person.employmentStatus)} className="mt-2">
                  {person.employmentStatus}
                </Badge>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center text-sm">
                  <Mail className="mr-2 h-4 w-4 text-gray-500" />
                  <a href={`mailto:${person.email}`} className="text-blue-600 hover:underline">
                    {person.email}
                  </a>
                </div>
                {person.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-gray-500" />
                    <span>{person.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Building2 className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{person.department.name} ({person.department.code})</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                  <span>
                    {person.location.name}, {person.location.city}, {person.location.country}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Briefcase className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{person.employmentType} ({person.fullTimeEquivalent * 100}% FTE)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {person.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{person.bio}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Employment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Start Date</p>
                  <p className="text-sm mt-1 flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                    {formatDate(person.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tenure</p>
                  <p className="text-sm mt-1">
                    {person.startDate ? calculateTenure(person.startDate) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Employment Type</p>
                  <p className="text-sm mt-1">{person.employmentType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">FTE</p>
                  <p className="text-sm mt-1">{person.fullTimeEquivalent * 100}%</p>
                </div>
                {person.endDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">End Date</p>
                    <p className="text-sm mt-1">{formatDate(person.endDate)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reporting Structure */}
          <Card>
            <CardHeader>
              <CardTitle>Reporting Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {person.manager && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Reports To
                  </p>
                  <Link href={`/people/${person.manager.id}`}>
                    <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <p className="font-medium">
                        {person.manager.firstName} {person.manager.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{person.manager.jobTitle}</p>
                    </div>
                  </Link>
                </div>
              )}

              {person.directReports.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Direct Reports ({person.directReports.length})
                  </p>
                  <div className="space-y-2">
                    {person.directReports.map((report) => (
                      <Link key={report.id} href={`/people/${report.id}`}>
                        <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <p className="font-medium">
                            {report.firstName} {report.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{report.jobTitle}</p>
                          <p className="text-xs text-gray-500">{report.email}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {!person.manager && person.directReports.length === 0 && (
                <p className="text-sm text-gray-500">No reporting structure</p>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          {person.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {person.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
