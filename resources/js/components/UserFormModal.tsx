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



interface User {
    id?: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt?: string;
    avatar?: string;
}

interface Props {
    isOpen: boolean;
    closeModal: () => void;
    user?: User | null;
}

export default function UserFormModal({ isOpen, closeModal, user }: Props) {
    const [formData, setFormData] = useState<User>({name: '', email: '', role: '', createdAt: new Date().toISOString().split('T')[0]});
     const [selectedFile, setSelectedFile] = useState<File | null>(null);
     const [preview, setPreview] = useState<string>("");
   useEffect(() => {
        if(user){
            setFormData({ name: user.name, email: user.email, role: user.role, createdAt: user.createdAt ||""});
             setPreview(user.avatar || ""); 
                setSelectedFile(null);     
            } else{
                setFormData({ name: '', email: '', role: '', createdAt: new Date().toISOString().split('T')[0]});
                 setPreview(""); 
                setSelectedFile(null);  
            }
        },[user]);
        
        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setFormData({
                ...formData,[e.target.name]: e.target.value,
            });
        };

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if(e.target.files && e.target.files[0]){
                const file = e.target.files[0];
                setSelectedFile(file);
                setPreview(URL.createObjectURL(file));
            }
        }

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('role', formData.role);
            data.append('createdAt', formData.createdAt);
             if(selectedFile){
                data.append('avatar', selectedFile);
                
            }
           const successMessage = user?.id ? "User updated successfully" : "User created successfully";
           const errorMessage = user?.id ? "Failed to Update User" : "Failed to create User";
            if(user?.id){
                data.append('_method', 'PUT');
                router.post(`/users/${user.id}`, data, {
                    
                    onSuccess: () =>{
                        toast.success(successMessage);
                        closeModal();
                        router.reload();
                    },
                    onError: (error) => {
                        toast.success(errorMessage);
                        console.error('Failed to submit user1'+ ': ', JSON.stringify(error));
                    },
                });
                
            }
            else{
                router.post("/users", data, {
                    onSuccess: () => {
                        toast.success(successMessage);
                        closeModal();
                        router.reload();
                    },
                    onError: (error) => {
                        toast.error(errorMessage);
                        console.error('Failed to submit user: ', JSON.stringify(error));
                    }
                })
            }
        }


        if(!isOpen) return null;
        return (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{user ? "Edit User" : "New User"}</DialogTitle>
                  <form onSubmit={handleSubmit} className="space-y-4" encType='multipart/form-data'>
                        <Label htmlFor="Name" className=""> Name </Label>
                        <Input 
                            id="Name" 
                            name='name' 
                            className='w-full max-w-full sm:max-w-sm' 
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                        />

                        <Label htmlFor="Email" className=""> Email </Label>
                        <Input 
                            id="Email" 
                            name='email' 
                            className='w-full max-w-full sm:max-w-sm' 
                            value={formData.email} 
                            onChange={handleChange} 
                            required
                        />

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-1/2">
                                <Label htmlFor="Role" className=""> Role </Label>
                                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value })}  >
                                    <SelectTrigger className="w-full max-w-full sm:max-w-sm">
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent className='w-full max-w-full sm:max-w-sm'>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full sm:w-1/2">
                                <Label htmlFor={user ? "UpdatedAt" : "CreatedAt"} className=""> {user ? "UpdatedAt" : "CreatedAt"} </Label>
                                <Input 
                                    id={user ? "UpdatedAt" : "CreatedAt"} 
                                    className='w-full max-w-full sm:max-w-sm' 
                                    name={user ? "UpdatedAt" : "CreatedAt"} 
                                    type="datetime-local" 
                                    value={new Date().toISOString().slice(0, 16)}
                                    onChange={handleChange} 
                                    required
                                />
                            </div>
                        </div>
                        <Label htmlFor="Avatar" className=""> Avatar </Label>
                        <div className='flex flex-col sm:flex-row items-center gap-2 w-full max-w-full sm:max-w-sm'>
                            <Input id="Avatar" name='avatar' type="file" accept="image/*" onChange={handleFileChange} className='w-full sm:w-1/2' />
                            {preview && <img src={preview} alt="Preview" className='w-16 h-16 rounded-full' />}
                            {user?.avatar && <img src={user.avatar} alt="Avatar" className='w-16 h-16 rounded-full' />}
                        </div>
                        <div className='flex flex-col sm:flex-row justify-end gap-2'>
                            <Button type='button' onClick={closeModal} className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition w-full sm:w-auto'>Cancel</Button>
                            <Button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full sm:w-auto'>{user ? "Update" : "Create"}</Button>
                        </div>
                  </form>
                </DialogHeader>
              </DialogContent>
        );
}