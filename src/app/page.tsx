import { getPreorders, deletePreorder } from './preorder';
import { Pagination } from './pagination';
import { PreorderStatusSwitch } from './preorder-status-switch';
import { cn } from './utils';
import { Preorder } from '@prisma/client';
import { format } from 'date-fns';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

type HomePageProps = {
  searchParams: {
    page?: string;
    filter?: 'All' | 'Active' | 'Inactive';
    sortBy?: 'name' | 'createdAt' | 'startsAt' | 'endsAt';
    sortOrder?: 'asc' | 'desc';
  };
};

export default async function Home({ searchParams }: HomePageProps) {
  const page = Number(searchParams.page) || 1;
  const limit = 8; // Or any other number you prefer
  const filter = searchParams.filter || 'All';
  const sortBy = searchParams.sortBy || 'createdAt';
  const sortOrder = searchParams.sortOrder || 'desc';

  const { data: preorders, totalCount, totalPages } = await getPreorders({
    page,
    limit,
    filter,
    sortBy,
    sortOrder,
  });

  const SortLink = ({ by, children }: { by: typeof sortBy, children: React.ReactNode }) => {
    const newSortOrder = sortBy === by && sortOrder === 'asc' ? 'desc' : 'asc';
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', by);
    params.set('sortOrder', newSortOrder);

    return (
      <Link href={`?${params.toString()}`} className="flex items-center gap-1">
        {children}
        {sortBy === by && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
      </Link>
    );
  };

  const FilterLink = ({ value, children }: { value: typeof filter, children: React.ReactNode }) => {
    const params = new URLSearchParams(searchParams);
    params.set('filter', value);
    params.set('page', '1'); // Reset to first page on filter change

    return (
      <Link
        href={`?${params.toString()}`}
        className={cn(
          'rounded-full px-3 py-1 text-sm font-medium',
          filter === value ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        )}
      >
        {children}
      </Link>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">Preorders</h1>
          <p className="mt-2 text-sm text-gray-700">A list of all the preorders in your account.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/preorders/new"
            className="inline-flex items-center gap-x-2 rounded-md bg-gray-800 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800"
          >
            <Plus className="-ml-0.5 h-5 w-5" />
            Create Preorder
          </Link>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterLink value="All">All</FilterLink>
          <FilterLink value="Active">Active</FilterLink>
          <FilterLink value="Inactive">Inactive</FilterLink>
        </div>
        {/* Simple sort display for now. A dropdown can be added here. */}
        <div className="text-sm text-gray-500">
          Sorting by <span className="font-semibold text-gray-700">{sortBy} ({sortOrder})</span>
        </div>
      </div>

      <div className="mt-4 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="relative px-7 sm:w-12 sm:px-6"><input type="checkbox" className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" /></th>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"><SortLink by="name">Name</SortLink></th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Products</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Preorder When</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"><SortLink by="startsAt">Starts At</SortLink></th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"><SortLink by="endsAt">Ends At</SortLink></th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {preorders.length > 0 ? (
                    preorders.map((preorder: Preorder) => (
                      <tr key={preorder.id}>
                        <td className="relative px-7 sm:w-12 sm:px-6"><input type="checkbox" className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" /></td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{preorder.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{preorder.products}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{preorder.preorderWhen}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{format(preorder.startsAt, 'MMM d, yyyy hh:mm a')}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{preorder.endsAt ? format(preorder.endsAt, 'MMM d, yyyy hh:mm a') : 'N/A'}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><PreorderStatusSwitch id={preorder.id} status={preorder.status} /></td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex items-center justify-end gap-x-4">
                            <Link href={`/preorders/${preorder.id}/edit`} className="text-gray-400 hover:text-gray-600"><Pencil className="h-4 w-4" /></Link>
                            <form action={deletePreorder.bind(null, preorder.id)}>
                              <button type="submit" className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="whitespace-nowrap px-3 py-12 text-center text-sm text-gray-500">No preorders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Pagination currentPage={page} totalPages={totalPages} totalCount={totalCount} limit={limit} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
