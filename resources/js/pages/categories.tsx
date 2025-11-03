import { type BreadcrumbItem } from '@/types';
import { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import CategoryFormModal from '@/components/CategoryModal';
import AppLayout from '@/layouts/app-layout';
import { Toaster, toast } from 'sonner';
import {Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader,DialogDescription, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/categories',
    }
];

export default function Categories({categories}) {

    const { data, links, meta } = categories;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const  [selectedcategory, setSelectedcategory] =  useState(null);

    const openModal = (categories = null) =>{
        setSelectedcategory(categories);
        setIsModalOpen(true);
    }
    const handleDelete = (id: number) =>{
        router.delete(`/categories/${id}`, {
            onSuccess: ()=>{
              toast.success('category deleted successfully');
              router.reload();  
            },
            onError: () => {
                toast.success('Failed to delete category');
                console.error('Failed to delete category');
            },
        });
    };

    const { filters } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    
    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/categories', { search }, {
            preserveState: true,
            preserveScroll: true,
        });
    };
     
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get('/categories', { search }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500); 

        return () => clearTimeout(timeout);
    }, [search]);

    const [selectedRows, setSelectedRows] = useState(new Set()); 

    const handleRowSelect = (categoryId) => {
        setSelectedRows((prevSelected) => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(categoryId)) {
                newSelected.delete(categoryId); 
            } else {
                newSelected.add(categoryId); 
            }
            return newSelected;
        });
    };

    const handleSelectAll = () => {
        if (selectedRows.size === categories.data.length) {
            setSelectedRows(new Set()); 
        } else {
            setSelectedRows(new Set(categories.data.map((category) => category.id)));
        }
    };

    const handleBulkDelete = () => {
        
          router.post('/categories/bulk-delete', {
            ids: Array.from(selectedRows),
          }, {
            onSuccess: () => {
              toast.success('Selected categories deleted');
              setSelectedRows(new Set());
              router.reload();
            },
            onError: () => toast.error('Failed to delete selected categories'),
          });
      };

      const handleTogglePublish = (id: number, publier: boolean) => {
        router.put(`/categories/${id}/toggle-publish`, { publier }, {
          preserveScroll: true,
          onSuccess: () => toast.success("Status updated"),
          onError: () => toast.error("Failed to update"),
        });
      };
      
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            
            <Toaster position="top-right" richColors/>
            <Head title="Categories" />
            <div className="my-3 mx-4 flex items-center justify-between flex-wrap gap-4">
                
                    <form onSubmit={handleSearch} className="my-3 flex items-center justify-between flex-wrap gap-4">
                        <Input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search categories..."
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
                                        <DialogTitle>Are you sure you want to delete selected categories ?</DialogTitle>
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
                                <DialogTrigger onClick={() => openModal()} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition w-full sm:w-auto text-center">Add Category</DialogTrigger>
                                <CategoryFormModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} category={selectedcategory} />
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
                        <TableHead className="w-[100px]">Name</TableHead>
                        <TableHead className="w-[300px]">Description</TableHead>
                        <TableHead className="w-[100px]">Publier</TableHead>
                        <TableHead className="w-[200px]">Created At</TableHead>
                        <TableHead className="w-[100px]">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        categories.data.length ? (
                            categories.data.map((category) => (
                                <TableRow key={category.id} className={selectedRows.has(category.id) ? 'bg-muted/90' : ''}>
                                    <TableCell >
                                        <Checkbox
                                            checked={selectedRows.has(category.id)}
                                            onCheckedChange={() => handleRowSelect(category.id)}
                                        />
                                    </TableCell>
                                    <TableCell> {category.nom} </TableCell>
                                    <TableCell> {category.description} </TableCell>
                                    <TableCell> <Switch checked={category.publier} onCheckedChange={(checked) => handleTogglePublish(category.id, checked)}></Switch> </TableCell>
                                    <TableCell> {new Date(category.created_at).toLocaleString()} </TableCell>
                                    <TableCell> 
                                        <Dialog>
                                            <DialogTrigger onClick={() =>openModal(category)} className='bg-blue-500 text-sm text-white px-3 py-1 rounded'> Edit</DialogTrigger>
                                            <CategoryFormModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} category={selectedcategory} />
                                        </Dialog> 
                                        
                                        <Dialog>
                                            <DialogTrigger  className='bg-red-500 text-sm text-white px-3 py-1 rounded mx-3'> Delete</DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Are you sure you want to delete this category?</DialogTitle>
                                                    <DialogDescription>This action cannot be undone.</DialogDescription>
                                                    <div className='flex justify-end gap-2'>
                                                        <button type='button' onClick={() => handleDelete(category.id)} className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition'>Delete</button>
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
                                <TableCell className="text-center" colSpan={5}>No categories found</TableCell>
                            </TableRow>
                        )
                    }
                </TableBody>
                </Table>
            </div>
           
        <div className="flex items-center justify-end space-x-2 py-4 px-4">
            <Button
              onClick={() => {
                if (categories.prev_page_url) {
                  router.get(categories.prev_page_url, { search }, {
                    preserveState: true,
                    preserveScroll: true,
                  });
                }
              }}
              disabled={!categories.prev_page_url}>
              Previous
            </Button>

         <Button
           onClick={() => {
             if (categories.next_page_url) {
               router.get(categories.next_page_url, { search }, {
                 preserveState: true,
                 preserveScroll: true,
               });
             }
           }}
           disabled={!categories.next_page_url} >
           Next
         </Button>
        </div>

          
        </AppLayout>
    );
}
