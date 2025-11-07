import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const person = await prisma.person.findUnique({
      where: { id: params.id, deletedAt: null },
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
        location: {
          select: { id: true, name: true, code: true, city: true, country: true },
        },
        manager: {
          select: { id: true, firstName: true, lastName: true, jobTitle: true },
        },
        directReports: {
          where: { deletedAt: null },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            email: true,
          },
        },
      },
    });

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    return NextResponse.json(person);
  } catch (error) {
    console.error('Error fetching person:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    if (session.user.role !== 'HR_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Get current person for audit
    const currentPerson = await prisma.person.findUnique({
      where: { id: params.id },
    });

    if (!currentPerson) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    const updatedPerson = await prisma.person.update({
      where: { id: params.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        preferredName: body.preferredName,
        email: body.email,
        phone: body.phone,
        jobTitle: body.jobTitle,
        employmentStatus: body.employmentStatus,
        employmentType: body.employmentType,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        fullTimeEquivalent: body.fullTimeEquivalent,
        locationId: body.locationId,
        departmentId: body.departmentId,
        managerId: body.managerId || null,
        skills: body.skills,
        bio: body.bio,
        updatedBy: session.user.id,
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
        entityId: params.id,
        action: 'UPDATE',
        changedBy: session.user.id,
        changes: {
          before: currentPerson,
          after: updatedPerson,
        },
      },
    });

    return NextResponse.json(updatedPerson);
  } catch (error: any) {
    console.error('Error updating person:', error);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions (only SUPER_ADMIN can delete)
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete
    const person = await prisma.person.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        updatedBy: session.user.id,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'Person',
        entityId: params.id,
        action: 'DELETE',
        changedBy: session.user.id,
        changes: { deleted: person },
      },
    });

    return NextResponse.json({ message: 'Person deleted successfully' });
  } catch (error) {
    console.error('Error deleting person:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
