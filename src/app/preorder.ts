'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../../prisma';

type GetPreordersParams = {
  page?: number;
  limit?: number;
  filter?: 'All' | 'Active' | 'Inactive';
  sortBy?: 'name' | 'createdAt' | 'startsAt' | 'endsAt';
  sortOrder?: 'asc' | 'desc';
};

/**
 * Fetches a paginated, filtered, and sorted list of preorders.
 * All logic is executed at the database level for efficiency.
 */
export async function getPreorders({
  page = 1,
  limit = 10,
  filter = 'All',
  sortBy = 'createdAt',
  sortOrder = 'desc',
}: GetPreordersParams) {
  const where: Prisma.PreorderWhereInput = {};
  if (filter === 'Active') {
    where.status = true;
  } else if (filter === 'Inactive') {
    where.status = false;
  }

  const orderBy: Prisma.PreorderOrderByWithRelationInput = {
    [sortBy]: sortOrder,
  };

  const skip = (page - 1) * limit;

  try {
    const [data, totalCount] = await prisma.$transaction([
      prisma.preorder.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.preorder.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return { data, totalCount, totalPages };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch preorders.');
  }
}

/**
 * Fetches a single preorder by its ID.
 */
export async function getPreorderById(id: string) {
  try {
    return await prisma.preorder.findUnique({ where: { id } });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch preorder with id ${id}.`);
  }
}

/**
 * Creates a new preorder record.
 */
export async function createPreorder(data: Omit<Prisma.PreorderCreateInput, 'id'>) {
  try {
    const preorder = await prisma.preorder.create({ data });
    revalidatePath('/');
    return preorder;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create preorder.');
  }
}

/**
 * Updates an existing preorder record.
 */
export async function updatePreorder(id: string, data: Prisma.PreorderUpdateInput) {
  try {
    const preorder = await prisma.preorder.update({ where: { id }, data });
    revalidatePath('/');
    return preorder;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to update preorder with id ${id}.`);
  }
}

/**
 * Deletes a preorder record by its ID.
 */
export async function deletePreorder(id: string) {
  try {
    await prisma.preorder.delete({ where: { id } });
    revalidatePath('/');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to delete preorder with id ${id}.`);
  }
}

/**
 * Toggles the status of a preorder between Active (true) and Inactive (false).
 */
export async function togglePreorderStatus(id: string, currentStatus: boolean) {
  try {
    const preorder = await prisma.preorder.update({
      where: { id },
      data: { status: !currentStatus },
    });
    revalidatePath('/');
    return preorder;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to toggle status for preorder with id ${id}.`);
  }
}