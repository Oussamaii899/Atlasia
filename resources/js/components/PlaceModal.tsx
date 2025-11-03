import {useState , useEffect} from 'react';
import { router} from '@inertiajs/react';
import { Card } from './ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Copy } from 'lucide-react';
import { Label } from './ui/label';
import { Toaster, toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TabList, Textarea } from '@headlessui/react';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';




interface Place {
    id?: number;
    name: string;
    slug?: string;
    description: string;
    lng: string;
    lat: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    city: string;
    category_id: number;
    createdAt: string;
    updatedAt?: string;
    publier: boolean;
    review_count?: number;
    rating?: number;
    amenities?: string[];
    images?: string[];
}

interface Category {
    id: number;
    nom: string;
}

interface Props {
    isOpen: boolean;
    closeModal: () => void;
    place?: Place | null;
    categories: Category[];
}

export default function PlaceFormModal({ isOpen, closeModal, place, categories }: Props) {
    const [formData, setFormData] = useState<Place>({name: '', slug: '', description: '',lng:'' , lat:'' , email: '',phone:'', address:'',website:'',city:'',category_id: 0, createdAt: new Date().toISOString().split('T')[0], publier: false , review_count: 0, rating: 0, amenities: []});
     const [images, setImages] = useState<File[]>([]);
    
   useEffect(() => {
        if(place){
            setFormData({ name: place.name, slug: place.slug, description: place.description, lng: place.lng, lat: place.lat, email: place.email, phone: place.phone, address: place.address, website: place.website, city: place.city, category_id: place.category_id, createdAt: place.createdAt || "", publier: place.publier || false, review_count: place.review_count || 0, rating: place.rating || 0, amenities: place.amenities || [] });
               
            } else{
                setFormData({ name: '', slug: '', description: '',lng:'' , lat:'' , email: '',phone:'', address:'',website:'',city:'',category_id: 0, createdAt: new Date().toISOString().split('T')[0] , publier: false , review_count: 0, rating: 0, amenities: []});

            }
        },[place]);
        
        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setFormData({
                ...formData,[e.target.name]: e.target.value,
            });
        };


        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            const data = new FormData();
            data.append('name', formData.name);
            data.append('slug', formData.name.toLowerCase().replace(/\s+/g, '-'));
            data.append('description', formData.description);
            data.append('lng',formData.lng);
            data.append('lat',formData.lat);
            data.append('email',formData.email);
            data.append('phone',formData.phone);
            data.append('address',formData.address);
            data.append('website',formData.website);
            data.append('city',formData.city);
            data.append('category_id', formData.category_id);
            data.append('publier', formData.publier ? '1' : '0');
            data.append('category_id', formData.category_id.toString());
            data.append('createdAt', formData.createdAt);
            data.append('review_count', formData.review_count?.toString() || '0');
            data.append('rating', formData.rating?.toString() || '0');
            (formData.amenities || []).forEach((item) => {
              data.append('amenities[]', item);
            });
            images.forEach((image) => {
                data.append('images[]', image);
            });

             
           const successMessage = place?.id ? "place updated successfully" : "place created successfully";
           const errorMessage = place?.id ? "Failed to Update place" : "Failed to create place";
            if(place?.id){
                data.append('_method', 'PUT');
                router.post(`/places/${place.id}`, data, {
                    
                    onSuccess: () =>{
                        toast.success(successMessage);
                        closeModal();
                        router.reload();
                    },
                    onError: (error) => {
                        toast.error(errorMessage);
                        console.error('Failed to submit places'+ ': ', JSON.stringify(error));
                    },
                });
                
            }
            else{
                router.post("/places", data, {
                    onSuccess: () => {
                        toast.success(successMessage);
                        closeModal();
                        router.reload();
                    },
                    onError: (error) => {
                        toast.error(errorMessage);
                        console.error('Failed to submit place: ', JSON.stringify(error));
                    }
                })
            }
        }


        if(!isOpen) return null;
        return (
              <DialogContent>
                <Tabs defaultValue="form" className="w-full">
                    <div className='px-6 pt-6'>
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="form" className="w-full">
                                Details
                            </TabsTrigger>
                            <TabsTrigger value="images" className="w-full">
                                Images
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="form">
                        <DialogHeader>
                            <DialogTitle>{place ? "Edit place" : "New place"}</DialogTitle>
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4 pr-2 max-h-none sm:max-h-[70vh] sm:overflow-y-auto max-sm:max-h-[60vh] max-sm:overflow-y-auto"
                                encType='multipart/form-data'
                                style={{ scrollbarGutter: 'stable' }}
                            >
                                <Label htmlFor="name" className=""> Name </Label>
                                <Input 
                                    id="name" 
                                    name="name" 
                                    className="w-full sm:max-w-sm" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    required 
                                    style={{ maxWidth: '100%' }} 
                                />
                                <div className='flex flex-col sm:flex-row gap-4'>
                                    <div className='w-full sm:w-1/2'>
                                        <Label htmlFor="category_id" className="">Category</Label>
                                        <Select
                                            value={formData.category_id ? String(formData.category_id) : ""}
                                            onValueChange={(value) => setFormData({ ...formData, category_id: Number(value) })}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent className='w-full'>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                                        {cat.nom}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className='w-full sm:w-1/2 flex items-center mt-2 sm:mt-0'>
                                        <Label htmlFor="Publier" className="px-3"> Publier </Label>
                                        <div className='flex items-center'>
                                            <Switch
                                                checked={formData.publier}
                                                onCheckedChange={(checked) => setFormData({ ...formData, publier: !!checked })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Label htmlFor="description" className=""> description </Label>
                                <Textarea id="description" name='description' className='w-full border rounded p-1' value={formData.description} onChange={handleChange} />

                                <div className='flex flex-col sm:flex-row gap-4'>
                                    <div className='w-full sm:w-1/2'>
                                        <Label htmlFor="address" className=""> Address </Label>
                                        <Input 
                                            id="address" 
                                            name="address" 
                                            className='w-full' 
                                            value={formData.address} 
                                            onChange={handleChange} 
                                            required
                                        />
                                    </div>
                                    <div className='w-full sm:w-1/2'>
                                        <Label htmlFor="website" className=""> Website </Label>
                                        <Input 
                                            id="website" 
                                            name="website" 
                                            className='w-full' 
                                            value={formData.website} 
                                            onChange={handleChange} 
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium text-gray-700">Coordinates:</span>
                                    <span className="text-xs text-gray-500">(Longitude & Latitude)</span>
                                </div>
                                <div className='flex flex-col sm:flex-row gap-4'>
                                    <div className='w-full sm:w-1/2'>
                                        <Label htmlFor="lng" className=""> Longitude </Label>
                                        <Input 
                                            id="lng" 
                                            name="lng" 
                                            className='w-full' 
                                            value={formData.lng} 
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className='w-full sm:w-1/2'>
                                        <Label htmlFor="lat" className=""> Latitude </Label>
                                        <Input 
                                            id="lat" 
                                            name="lat" 
                                            className='w-full' 
                                            value={formData.lat} 
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className='flex flex-col sm:flex-row gap-4'>
                                    <div className='w-full sm:w-1/2'>
                                        <Label htmlFor="email" className=""> Email </Label>
                                        <Input 
                                            id="email" 
                                            name="email" 
                                            className='w-full' 
                                            value={formData.email} 
                                            onChange={handleChange} 
                                            required
                                        />
                                    </div>
                                    <div className='w-full sm:w-1/2'>
                                        <Label htmlFor="phone" className=""> Phone </Label>
                                        <Input 
                                            id="phone" 
                                            name="phone" 
                                            className='w-full' 
                                            value={formData.phone} 
                                            onChange={handleChange} 
                                            required
                                        />
                                    </div>
                                </div>
                                <div className='flex flex-col sm:flex-row gap-4'>
                                    <div className='w-full sm:w-1/2'>
                                        <Label htmlFor="city" className=""> City </Label>
                                        <Input 
                                            id="city" 
                                            name="city" 
                                            className='w-full' 
                                            value={formData.city} 
                                            onChange={handleChange} 
                                            required
                                        />
                                    </div>
                                    <div className='w-full sm:w-1/2'>
                                        <Label htmlFor="review_count" className=""> amenities </Label>
                                        <Textarea 
                                            id="review_count" 
                                            name="review_count" 
                                            className='w-full border rounded p-1' 
                                            value={formData.amenities?.join(', ')} 
                                            onChange={(e) => setFormData({ ...formData, amenities: e.target.value.split(',').map((item) => item.trim()) })} 
                                            required
                                        />
                                        <div className="flex items-center mt-2">
                                            <Copy className="h-4 w-4 text-gray-500 mr-2" />
                                            <span className="text-sm text-gray-500">Copy and paste amenities separated by commas</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor={place ? "UpdatedAt" : "CreatedAt"} className=""> {place ? "UpdatedAt" : "CreatedAt"} </Label>
                                    <Input 
                                        id={place ? "UpdatedAt" : "CreatedAt"} 
                                        className='w-50 sm:w-auto max-w-sm' 
                                        name={place ? "UpdatedAt" : "CreatedAt"} 
                                        type="datetime-local" 
                                        value={new Date().toISOString().slice(0, 16)}
                                        onChange={handleChange} 
                                        required
                                    />
                                </div>
                                <div className='flex justify-end gap-2'>
                                    <Button type='button' onClick={closeModal} className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition'>Cancel</Button>
                                    <Button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition'>{place ? "Update" : "Create"}</Button>
                                </div>
                            </form>
                        </DialogHeader>
                    </TabsContent> 
                    <TabsContent value="images">
                        <DialogHeader>
                            <DialogTitle>Images</DialogTitle>
                            <form onSubmit={handleSubmit} className="space-y-4" encType='multipart/form-data'>
                                <Label htmlFor="images" className="text-sm text-gray-500">
                                    You can select and add multiple images at once by holding Ctrl (Windows) or Cmd (Mac) while choosing files.
                                </Label>
                                <Input
                                    id="images"
                                    name="images"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => setImages(Array.from(e.target.files || []))}
                                />
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <Label htmlFor="images" className="text-sm text-gray-500">Preview:</Label>
                                    {images.map((image, idx) => (
                                        <div key={image.name + image.lastModified} className="relative w-24 h-24 overflow-hidden rounded border">
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`Preview ${image.name}`}
                                                className="object-cover w-full h-full"
                                            />
                                            <button
                                                type="button"
                                                className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-500 hover:text-white transition"
                                                onClick={() => {
                                                    setImages(prev => prev.filter((_, i) => i !== idx));
                                                }}
                                                title="Remove image"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {place?.images?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {place.images.map((img, idx) => (
                                            <div
                                                key={img.id || idx}
                                                className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 flex-shrink-0 overflow-hidden rounded border"
                                            >
                                                <img
                                                    src={img.url}
                                                    className="object-cover w-full h-full"
                                                    alt="Place image"
                                                />
                                                <Dialog>
                                                    <DialogTrigger className='absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-500 hover:text-white transition'>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Are you sure you want to delete this Image ?</DialogTitle>
                                                            <DialogDescription>This action cannot be undone.</DialogDescription>
                                                            <div className='flex justify-end gap-2'>
                                                                <Button
                                                                    variant="destructive"
                                                                    onClick={() => {
                                                                        router.delete(route('places.images.delete', img.id), {
                                                                            onSuccess: () => {
                                                                                toast.success("Image deleted successfully");
                                                                                window.location.reload();
                                                                            },
                                                                            onError: () => {
                                                                                toast.error("Failed to delete image");
                                                                            },
                                                                        });
                                                                    }}
                                                                    className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition'
                                                                >
                                                                    Delete
                                                                </Button>
                                                                <DialogClose type='button' className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition'>Cancel</DialogClose>
                                                            </div>
                                                        </DialogHeader>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className='flex justify-end gap-2'>
                                    <Button type='button' onClick={closeModal} className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition'>Cancel</Button>
                                    <Button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition'>{place ? "Update" : "Create"}</Button>
                                </div>
                            </form>
                        </DialogHeader>

                    </TabsContent>    
                </Tabs>
              </DialogContent>
        );
}