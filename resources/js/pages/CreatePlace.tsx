import {useState , useEffect} from 'react';
import { router} from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Toaster, toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TabList, Textarea } from '@headlessui/react';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Separator } from '@/components/ui/separator';




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
    user_id?: number;
}

interface Category {
    id: number;
    nom: string;
}

interface Props {
    isOpen: boolean;
    place?: Place | null;
    categories: Category[];
}

export default function CreatePlace({ place, categories }: Props) {
    const [formData, setFormData] = useState<Place>({name: '', slug: '', description: '',lng:'' , lat:'' , email: '',phone:'', address:'',website:'',city:'',category_id: 0, createdAt: new Date().toISOString().split('T')[0], publier: false , review_count: 0, rating: 0, amenities: [], user_id: undefined });
     const [images, setImages] = useState<File[]>([]);
    
   useEffect(() => {
                setFormData({ name: '', slug: '', description: '',lng:'' , lat:'' , email: '',phone:'', address:'',website:'',city:'',category_id: 0, createdAt: new Date().toISOString().split('T')[0] , publier: false , review_count: 0, rating: 0, amenities: [], user_id: undefined });
   }, [place]);
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
            data.append('category_id', formData.category_id.toString());
            data.append('createdAt', formData.createdAt);
            data.append('rating', formData.rating?.toString() || '0');
            (formData.amenities || []).forEach((item) => {
              data.append('amenities[]', item);
            });
            images.forEach((image) => {
                data.append('images[]', image);
            });

             
           const successMessage = "place created successfully";
           const errorMessage =  "Failed to create place";
                router.post("/place", data, {
                    onSuccess: () => {
                        toast.success(successMessage);
                        router.reload();
                    },
                    onError: (error) => {
                        toast.error(errorMessage);
                        console.error('Failed to submit place: ', JSON.stringify(error));
                    }
                })
            }

        const breadcrumbs: BreadcrumbItem[] = [
              {
                title: "Posts",
                href: "/posts",
              },
              {
                title: "Create",
                href: "/places/create",
              },
            ]
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Toaster position="top-right" richColors />

                <div className="p-4 mx-0 md:mx-10 lg:mx-40">
                    <Tabs defaultValue="form" className="w-full ">
                        <h1 className='font-bold text-2xl'>New Post</h1 >
                        <Separator></Separator>
                        <div className='px-6 pt-6 flex justify-center'>
                            <TabsList className="grid w-full max-w-7/12 grid-cols-2">
                                <TabsTrigger value="form" className="w-full">
                                    Details
                                </TabsTrigger>
                                <TabsTrigger value="images" className="w-full">
                                    Images
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value="form" className='px-6 pt-6'>
                            
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4 pr-2 flex flex-col max-h-none "
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
                                        <div className='w-full'>
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

                                    </div>

                                    <div>
                                        <Label htmlFor="description" className=""> description </Label>
                                        <Textarea id="description" name='description' className='w-full h-32 border rounded p-1' value={formData.description} onChange={handleChange} />
                                    </div>
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

                                    <div className='flex justify-end gap-2'>
                                        <Button type='button' /* onClick={closeModal} */ className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition'>Cancel</Button>
                                        <Button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition'>{place ? "Update" : "Create"}</Button>
                                    </div>
                                </form>
                        </TabsContent> 
                        <TabsContent value="images">
                            <DialogHeader>
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
                                    <div className='flex justify-end gap-2'>
                                        <Button type='button' /* onClick={closeModal} */ className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition'>Cancel</Button>
                                        <Button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition'>Create</Button>
                                    </div>
                                </form>
                            </DialogHeader>

                        </TabsContent>    
                    </Tabs>
                </div>
            </AppLayout>
        );
}