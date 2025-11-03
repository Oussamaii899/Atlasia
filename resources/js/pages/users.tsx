import { type BreadcrumbItem } from '@/types';
import { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import UserFormModal from '@/components/UserFormModal';
import AppLayout from '@/layouts/app-layout';
import { Toaster, toast } from 'sonner';
import {Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader,DialogDescription, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    }
];

export default function Users({users}) {

    const { data, links, meta } = users;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const  [selectedUser, setSelectedUser] =  useState(null);

    const openModal = (user = null) =>{
        setSelectedUser(user);
        setIsModalOpen(true);
    }
    const handleDelete = (id: number) =>{
        router.delete(`/users/${id}`, {
            onSuccess: ()=>{
              toast.success('User deleted successfully');
              router.reload();  
            },
            onError: () => {
                toast.success('Failed to delete User');
                console.error('Failed to delete User');
            },
        });
    };

    const { filters } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    
    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/users', { search }, {
            preserveState: true,
            preserveScroll: true,
        });
    };
     
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get('/users', { search }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500); 

        return () => clearTimeout(timeout);
    }, [search]);

    const [selectedRows, setSelectedRows] = useState(new Set()); 

    const handleRowSelect = (userId) => {
        setSelectedRows((prevSelected) => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(userId)) {
                newSelected.delete(userId); 
            } else {
                newSelected.add(userId); 
            }
            return newSelected;
        });
    };

    const handleSelectAll = () => {
        if (selectedRows.size === users.data.length) {
            setSelectedRows(new Set()); 
        } else {
            setSelectedRows(new Set(users.data.map((user) => user.id)));
        }
    };

    const handleBulkDelete = () => {
        
          router.post('/users/bulk-delete', {
            ids: Array.from(selectedRows),
          }, {
            onSuccess: () => {
              toast.success('Selected users deleted');
              setSelectedRows(new Set());
              router.reload();
            },
            onError: () => toast.error('Failed to delete selected users'),
          });
      };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            
            <Toaster position="top-right" richColors/>
            <Head title="Users" />
            <div className="my-3 mx-4 flex items-center justify-between flex-wrap gap-4">
                
                    <form onSubmit={handleSearch} className="my-3 flex items-center justify-between flex-wrap gap-4">
                        <Input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search users..."
                            className="px-3 py-2 border rounded w-full sm:w-auto max-w-sm"
                        />
                    </form>
                    <div>
                    {
                        selectedRows.size > 0 ? (
                            <Dialog>
                                <DialogTrigger  className='bg-red-500 text-sm text-white px-5 py-2 rounded mx-3'> Delete</DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Are you sure you want to delete selected users ?</DialogTitle>
                                        <DialogDescription>This action cannot be undone.</DialogDescription>
                                        <div className='flex justify-end gap-2'>
                                        <Button
                                          variant="destructive"
                                          onClick={handleBulkDelete} 
                                          disabled={selectedRows.size === 0}
                                          className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition'
                                        >
                                          Delete Selected
                                        </Button>
                                        <DialogClose type='button' onClick={() => setIsModalOpen(false)} className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition'>Cancel</DialogClose>

                                        </div>

                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                        ): 
                        (
                            <Dialog>
                                <DialogTrigger onClick={() => openModal()} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition w-full sm:w-auto text-center">Add User</DialogTrigger>
                                <UserFormModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} user={selectedUser} />
                            </Dialog>
                        )
                    }
        </div>
                </div>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 m-3 rounded-md border">
                
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableCell className="w-[20px]">
                    <Checkbox
                          checked={selectedRows.size === data.length} 
                          onCheckedChange={handleSelectAll}
                          className="mr-2"
                        />
                    </TableCell>
                        <TableHead className="w-[50px]">avatar</TableHead>
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead className="w-[200px]">Email</TableHead>
                        <TableHead className="w-[100px]">Role</TableHead>
                        <TableHead className="w-[200px]">Created At</TableHead>
                        <TableHead className="w-[100px]">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        users.data.length ? (
                            users.data.map((user) => (
                                <TableRow key={user.id} className={selectedRows.has(user.id) ? 'bg-muted/90' : ''}>
                                    <TableCell >
                                        <Checkbox
                                            checked={selectedRows.has(user.id)}
                                            onCheckedChange={() => handleRowSelect(user.id)}
                                        />
                                    </TableCell>
                                    <TableCell> 
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                        )}
                                    </TableCell>
                                    <TableCell className=' hover:underline hover:text-blue-200 cursor-pointer' onClick={() => router.visit('/user/'+user.id)}> {user.name} </TableCell>
                                    <TableCell> {user.email} </TableCell>
                                    <TableCell> {user.role} </TableCell>
                                    <TableCell> {new Date(user.created_at).toLocaleString()} </TableCell>
                                    <TableCell> 
                                        <Dialog>
                                            <DialogTrigger onClick={() =>openModal(user)} className='bg-blue-500 text-sm text-white px-3 py-1 rounded'> Edit</DialogTrigger>
                                            <UserFormModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} user={selectedUser} />
                                        </Dialog> 
                                        
                                        <Dialog>
                                            <DialogTrigger  className='bg-red-500 text-sm text-white px-3 py-1 rounded mx-3'> Delete</DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Are you sure you want to delete this user?</DialogTitle>
                                                    <DialogDescription>This action cannot be undone.</DialogDescription>
                                                    <div className='flex justify-end gap-2'>
                                                        <button type='button' onClick={() => handleDelete(user.id)} className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition'>Delete</button>
                                                        <DialogClose type='button' onClick={() => setIsModalOpen(false)} className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition'>Cancel</DialogClose>
                                                    </div>
                                                </DialogHeader>
                                            </DialogContent>
                                        </Dialog>
                                     </TableCell>
                                </TableRow>
                            ))
                        ): (
                            <TableRow>
                                <TableCell className="text-center" colSpan={5}>No users found</TableCell>
                            </TableRow>
                        )
                    }
                </TableBody>
                </Table>
            </div>
           
        <div className="flex items-center justify-end space-x-2 py-4 px-4">
            <Button
              onClick={() => {
                if (users.prev_page_url) {
                  router.get(users.prev_page_url, { search }, {
                    preserveState: true,
                    preserveScroll: true,
                  });
                }
              }}
              disabled={!users.prev_page_url}>
              Previous
            </Button>

         <Button
           onClick={() => {
             if (users.next_page_url) {
               router.get(users.next_page_url, { search }, {
                 preserveState: true,
                 preserveScroll: true,
               });
             }
           }}
           disabled={!users.next_page_url} >
           Next
         </Button>
        </div>

          
        </AppLayout>
    );
}
