import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const location = searchParams.get('location') || '';

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { jobTitle: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (department) {
      where.departmentId = department;
    }

    if (location) {
      where.locationId = location;
    }

    const people = await prisma.person.findMany({
      where,
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
        location: {
          select: { id: true, name: true, code: true },
        },
        manager: {
          select: { id: true, firstName: true, lastName: true },
        },
        directReports: {
          select: { id: true },
        },
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    });

    return NextResponse.json(people);
  } catch (error) {
    console.error('Error fetching people:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions (only HR_ADMIN and SUPER_ADMIN can create)
    if (session.user.role !== 'HR_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const person = await prisma.person.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        preferredName: body.preferredName,
        email: body.email,
        phone: body.phone,
        jobTitle: body.jobTitle,
        employmentStatus: body.employmentStatus || 'ACTIVE',
        employmentType: body.employmentType || 'FULL_TIME',
        startDate: body.startDate ? new Date(body.startDate) : null,
        fullTimeEquivalent: body.fullTimeEquivalent || 1.0,
        locationId: body.locationId,
        departmentId: body.departmentId,
        managerId: body.managerId || null,
        skills: body.skills || [],
        bio: body.bio,
        createdBy: session.user.id,
      },
      include: {
        department: true,
        location: true,
        manager: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'Person',
        entityId: person.id,
        action: 'CREATE',
        changedBy: session.user.id,
        changes: { created: person },
      },
    });

    return NextResponse.json(person, { status: 201 });
  } catch (error: any) {
    console.error('Error creating person:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
