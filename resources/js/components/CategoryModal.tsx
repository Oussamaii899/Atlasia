import {useState , useEffect} from 'react';
import { router} from '@inertiajs/react';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Copy } from 'lucide-react';
import { Label } from './ui/label';
import { Toaster, toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from '@headlessui/react';
import { Switch } from './ui/switch';



interface Category {
    id?: number;
    nom: string;
    description: string;
    position: string;
    createdAt: string;
    updatedAt?: string;
    publier: boolean;
}

interface Props {
    isOpen: boolean;
    closeModal: () => void;
    category?: Category | null;
}

export default function CategoryFormModal({ isOpen, closeModal, category }: Props) {
   const [formData, setFormData] = useState<Category>({nom: '', description: '', position: '', createdAt: new Date().toISOString().split('T')[0], publier: false});
     
   useEffect(() => {
        if(category){
            setFormData({ nom: category.nom, description: category.description, position: category.position, createdAt: category.createdAt || "", publier: category.publier || false });
               
            } else{
                setFormData({ nom: '', description: '', position: '', createdAt: new Date().toISOString().split('T')[0] , publier: false });
                
            }
        },[category]);
        
        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setFormData({
                ...formData,[e.target.name]: e.target.value,
            });
        };


        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            const data = new FormData();
            data.append('nom', formData.nom);
            data.append('description', formData.description);
            data.append('publier', formData.publier ? '1' : '0');
            data.append('createdAt', formData.createdAt);
             
           const successMessage = category?.id ? "category updated successfully" : "category created successfully";
           const errorMessage = category?.id ? "Failed to Update category" : "Failed to create category";
            if(category?.id){
                data.append('_method', 'PUT');
                router.post(`/categories/${category.id}`, data, {
                    
                    onSuccess: () =>{
                        toast.success(successMessage);
                        closeModal();
                        router.reload();
                    },
                    onError: (error) => {
                        toast.success(errorMessage);
                        console.error('Failed to submit categories'+ ': ', JSON.stringify(error));
                    },
                });
                
            }
            else{
                router.post("/categories", data, {
                    onSuccess: () => {
                        toast.success(successMessage);
                        closeModal();
                        router.reload();
                    },
                    onError: (error) => {
                        toast.error(errorMessage);
                        console.error('Failed to submit category: ', JSON.stringify(error));
                    }
                })
            }
        }


        if(!isOpen) return null;
        return (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle>
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    encType="multipart/form-data"
                  >
                    <Label htmlFor="Name">Name</Label>
                    <Input
                      id="Name"
                      name="nom"
                      className="w-full"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                    />

                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      className="w-full border rounded p-1"
                      value={formData.description}
                      onChange={handleChange}
                    />

                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center sm:w-1/2">
                        <Label htmlFor="Publier" className="px-3">
                          Publier
                        </Label>
                        <Switch
                          checked={formData.publier}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, publier: !!checked })
                          }
                        />
                      </div>

                      <div className="sm:w-1/2">
                        <Label htmlFor={category ? "UpdatedAt" : "CreatedAt"}>
                          {category ? "UpdatedAt" : "CreatedAt"}
                        </Label>
                        <Input
                          id={category ? "UpdatedAt" : "CreatedAt"}
                          className="w-full"
                          name={category ? "UpdatedAt" : "CreatedAt"}
                          type="datetime-local"
                          value={new Date().toISOString().slice(0, 16)}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                      <Button
                        type="button"
                        onClick={closeModal}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                      >
                        {category ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </DialogHeader>
              </DialogContent>
        );
}