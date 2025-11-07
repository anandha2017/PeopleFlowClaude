import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total people count
    const totalPeople = await prisma.person.count({
      where: { deletedAt: null, employmentStatus: 'ACTIVE' },
    });

    // Get total departments
    const totalDepartments = await prisma.department.count({
      where: { active: true },
    });

    // Get total locations
    const totalLocations = await prisma.location.count({
      where: { active: true },
    });

    // Get people by department
    const peopleByDepartment = await prisma.person.groupBy({
      by: ['departmentId'],
      where: { deletedAt: null, employmentStatus: 'ACTIVE' },
      _count: { id: true },
    });

    const departmentStats = await Promise.all(
      peopleByDepartment.map(async (item) => {
        const dept = await prisma.department.findUnique({
          where: { id: item.departmentId },
          select: { name: true, code: true },
        });
        return {
          name: dept?.name || 'Unknown',
          code: dept?.code || 'UNK',
          count: item._count.id,
        };
      })
    );

    // Get people by location
    const peopleByLocation = await prisma.person.groupBy({
      by: ['locationId'],
      where: { deletedAt: null, employmentStatus: 'ACTIVE' },
      _count: { id: true },
    });

    const locationStats = await Promise.all(
      peopleByLocation.map(async (item) => {
        const location = await prisma.location.findUnique({
          where: { id: item.locationId },
          select: { name: true, code: true },
        });
        return {
          name: location?.name || 'Unknown',
          code: location?.code || 'UNK',
          count: item._count.id,
        };
      })
    );

    // Get recent hires (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentHires = await prisma.person.count({
      where: {
        deletedAt: null,
        startDate: {
          gte: thirtyDaysAgo,
        },
      },
    });

    return NextResponse.json({
      totalPeople,
      totalDepartments,
      totalLocations,
      recentHires,
      departmentStats,
      locationStats,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
