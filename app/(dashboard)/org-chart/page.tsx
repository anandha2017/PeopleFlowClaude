'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  employmentStatus: string;
  department: { name: string; code: string };
  location: { name: string };
  manager: { id: string } | null;
  directReports: { id: string }[];
}

interface OrgNode {
  person: Person;
  reports: OrgNode[];
}

export default function OrgChartPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [orgTree, setOrgTree] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    try {
      const res = await fetch('/api/people');
      const data = await res.json();
      setPeople(data.filter((p: Person) => p.employmentStatus === 'ACTIVE'));
      buildOrgTree(data.filter((p: Person) => p.employmentStatus === 'ACTIVE'));
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildOrgTree = (peopleData: Person[]) => {
    // Find root nodes (people without managers)
    const roots = peopleData.filter((p) => !p.manager);

    const buildNode = (person: Person): OrgNode => {
      const reports = peopleData
        .filter((p) => p.manager?.id === person.id)
        .map((p) => buildNode(p));

      return {
        person,
        reports,
      };
    };

    const tree = roots.map((root) => buildNode(root));
    setOrgTree(tree);

    // Expand root nodes by default
    const initialExpanded = new Set(roots.map((r) => r.id));
    setExpandedNodes(initialExpanded);
  };

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: OrgNode, level: number = 0) => {
    const hasReports = node.reports.length > 0;
    const isExpanded = expandedNodes.has(node.person.id);

    return (
      <div key={node.person.id} className="relative">
        <div
          className={`flex items-center gap-2 ${level > 0 ? 'ml-8' : ''}`}
          style={{ marginLeft: level > 0 ? `${level * 2}rem` : 0 }}
        >
          {hasReports && (
            <button
              onClick={() => toggleNode(node.person.id)}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>
          )}
          {!hasReports && <div className="w-6" />}

          <Link href={`/people/${node.person.id}`} className="flex-1">
            <Card className="hover:shadow-md transition-shadow cursor-pointer mb-2">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getInitials(node.person.firstName, node.person.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">
                        {node.person.firstName} {node.person.lastName}
                      </p>
                      {hasReports && (
                        <Badge variant="secondary" className="text-xs">
                          {node.reports.length}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {node.person.jobTitle}
                    </p>
                    <p className="text-xs text-gray-500">
                      {node.person.department.name} • {node.person.location.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {hasReports && isExpanded && (
          <div className="space-y-1">
            {node.reports.map((report) => renderNode(report, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading org chart...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Organisation Chart</h1>
        <p className="text-gray-600 mt-1">
          Hierarchical view of reporting structure
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {orgTree.length > 0 ? (
              orgTree.map((node) => renderNode(node))
            ) : (
              <p className="text-gray-500 text-center py-8">No org chart data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-500">
        <p>• Click on names to view full profile</p>
        <p>• Numbers show count of direct reports</p>
        <p>• Click arrows to expand/collapse teams</p>
      </div>
    </div>
  );
}
