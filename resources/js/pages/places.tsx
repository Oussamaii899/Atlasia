import { type BreadcrumbItem } from '@/types';
import { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import PlaceFormModal from '@/components/PlaceModal';
import AppLayout from '@/layouts/app-layout';
import { Toaster, toast } from 'sonner';
import {Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader,DialogDescription, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { SelectTrigger } from '@radix-ui/react-select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Places',
        href: '/places',
    }
];

export default function Places({places, categories}) {

    const { data, links, meta } = places;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const  [selectedplace, setSelectedplace] =  useState(null);

    console.log(places);
    const openModal = (places = null) =>{
        setSelectedplace(places);
        setIsModalOpen(true);
    }
    const handleDelete = (id: number) =>{
        router.delete(`/places/${id}`, {
            onSuccess: ()=>{
              toast.success('place deleted successfully');
              router.reload();  
            },
            onError: () => {
                toast.success('Failed to delete place');
                console.error('Failed to delete place');
            },
        });
    };

    const { filters } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    
    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/places', { search }, {
            preserveState: true,
            preserveScroll: true,
        });
    };
     
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get('/places', { search }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500); 

        return () => clearTimeout(timeout);
    }, [search]);

    const [selectedRows, setSelectedRows] = useState(new Set()); 
    

    const handleRowSelect = (placeId) => {
        setSelectedRows((prevSelected) => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(placeId)) {
                newSelected.delete(placeId); 
            } else {
                newSelected.add(placeId); 
            }
            return newSelected;
        });
    };

    const handleSelectAll = () => {
        if (selectedRows.size === places.data.length) {
            setSelectedRows(new Set()); 
        } else {
            setSelectedRows(new Set(places.data.map((place) => place.id)));
        }
    };

    const handleBulkDelete = () => {
        
          router.post('/places/bulk-delete', {
            ids: Array.from(selectedRows),
          }, {
            onSuccess: () => {
              toast.success('Selected places deleted');
              setSelectedRows(new Set());
              router.reload();
            },
            onError: () => toast.error('Failed to delete selected places'),
          });
      };

      const handleTogglePublish = (id: number, publier: boolean) => {
        router.put(`/places/${id}/toggle-publish`, { publier }, {
          preserveScroll: true,
          onSuccess: () => toast.success("Status updated"),
          onError: () => toast.error("Failed to update"),
        });
      };

        const handleStatusUpdate = (id: number, status: string) => {
          router.put(
            `/places/${id}/status`,
            { status },
            {
              preserveScroll: true,
              onSuccess: () => toast.success("Status updated successfully"),
              onError: () => toast.error("Failed to update status"),
            },
          )
        }
      
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            
            <Toaster position="top-right" richColors/>
            <Head title="Places" />
            <div className="my-3 mx-4 flex items-center justify-between flex-wrap gap-4">
                
                    <form onSubmit={handleSearch} className="my-3 flex items-center justify-between flex-wrap gap-4">
                        <Input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search places..."
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
                                        <DialogTitle>Are you sure you want to delete selected Places ?</DialogTitle>
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
                                <DialogTrigger onClick={() => openModal()} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition w-full sm:w-auto text-center">Add Place</DialogTrigger>
                                <PlaceFormModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} place={selectedplace} categories={categories} />
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
                        <TableHead className="w-[100px]">Category</TableHead>
                        <TableHead className="w-[200px]">Status</TableHead>
                        <TableHead className="w-[100px]">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        places.data.length ? (
                            places.data.map((place) => (
                                <TableRow key={place.id} className={selectedRows.has(place.id) ? 'bg-muted/90' : ''}>
                                    <TableCell >
                                        <Checkbox
                                            checked={selectedRows.has(place.id)}
                                            onCheckedChange={() => handleRowSelect(place.id)}
                                        />
                                    </TableCell>
                                    <TableCell> {place.name} </TableCell>
                                    <TableCell>
                                        {place.description
                                            ? place.description.length > 100
                                                ? place.description.slice(0, 100) + '...'
                                                : place.description
                                            : ''}
                                    </TableCell>
                                    <TableCell> <Switch checked={place.publier} onCheckedChange={(checked) => handleTogglePublish(place.id, checked)}></Switch> </TableCell>
                                    <TableCell> {place.category?.nom} </TableCell>
                                    <TableCell> 
                                            <Select value={place.status} onValueChange={(value) => handleStatusUpdate(place.id, value)}>
                                                <SelectTrigger>
                                                    <SelectValue></SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='approved'>approved</SelectItem>
                                                    <SelectItem value='rejected'>rejected</SelectItem>
                                                    <SelectItem value='queue'>queue</SelectItem>
                                                </SelectContent>
                                            </Select>
                                    </TableCell>
                                    <TableCell> 
                                        <Dialog>
                                            <DialogTrigger onClick={() =>openModal(place)} className='bg-blue-500 text-sm text-white px-3 py-1 rounded'> Edit</DialogTrigger>
                                            <PlaceFormModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} place={selectedplace} categories={categories}/>
                                        </Dialog> 
                                        
                                        <Dialog>
                                            <DialogTrigger  className='bg-red-500 text-sm text-white px-3 py-1 rounded mx-3'> Delete</DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Are you sure you want to delete this place?</DialogTitle>
                                                    <DialogDescription>This action cannot be undone.</DialogDescription>
                                                    <div className='flex justify-end gap-2'>
                                                        <button type='button' onClick={() => handleDelete(place.id)} className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition'>Delete</button>
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
                                <TableCell className="text-center" colSpan={5}>No places found</TableCell>
                            </TableRow>
                        )
                    }
                </TableBody>
                </Table>
            </div>
           
        <div className="flex items-center justify-end space-x-2 py-4 px-4">
            <Button
              onClick={() => {
                if (places.prev_page_url) {
                  router.get(places.prev_page_url, { search }, {
                    preserveState: true,
                    preserveScroll: true,
                  });
                }
              }}
              disabled={!places.prev_page_url}>
              Previous
            </Button>

         <Button
           onClick={() => {
             if (places.next_page_url) {
               router.get(places.next_page_url, { search }, {
                 preserveState: true,
                 preserveScroll: true,
               });
             }
           }}
           disabled={!places.next_page_url} >
           Next
         </Button>
        </div>

          
        </AppLayout>
    );
}
