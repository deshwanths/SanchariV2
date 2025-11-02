
'use client';

import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getFirestore, collection, query, doc, deleteDoc, orderBy, limit, getDocs, startAfter, QueryDocumentSnapshot, updateDoc } from 'firebase/firestore';
import type { GeneratePersonalizedItineraryOutput } from '@/ai/flows/generate-personalized-itinerary';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Trash2, Edit } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Define the structure for the itinerary document as stored in Firestore
type SavedItineraryDocument = {
    id: string;
    userId: string;
    title: string;
    destination: string;
    createdAt: any; // Can be a Timestamp object
    itineraryData: GeneratePersonalizedItineraryOutput;
};

const ITINERARIES_PER_PAGE = 6;

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [itineraries, setItineraries] = useState<SavedItineraryDocument[]>([]);
  const [loadingItineraries, setLoadingItineraries] = useState(true);
  const [itineraryToDelete, setItineraryToDelete] = useState<string | null>(null);
  const [itineraryToEdit, setItineraryToEdit] = useState<SavedItineraryDocument | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  const fetchItineraries = useCallback(async (startAfterDoc: QueryDocumentSnapshot | null = null) => {
    if (!user) return;

    if (startAfterDoc) {
      setIsFetchingMore(true);
    } else {
      setLoadingItineraries(true);
      setItineraries([]); // Reset on initial load
    }

    const db = getFirestore();
    const itinerariesRef = collection(db, 'users', user.uid, 'itineraries');
    
    let q;
    if (startAfterDoc) {
        q = query(itinerariesRef, orderBy("createdAt", "desc"), startAfter(startAfterDoc), limit(ITINERARIES_PER_PAGE));
    } else {
        q = query(itinerariesRef, orderBy("createdAt", "desc"), limit(ITINERARIES_PER_PAGE));
    }
    
    try {
        const querySnapshot = await getDocs(q);
        const newItineraries: SavedItineraryDocument[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<SavedItineraryDocument, 'id'>)
        }));

        setItineraries(prev => startAfterDoc ? [...prev, ...newItineraries] : newItineraries);
        
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastDoc(lastVisible);

        if (querySnapshot.docs.length < ITINERARIES_PER_PAGE) {
            setHasMore(false);
        }

    } catch (error) {
        console.error("Error fetching itineraries: ", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch your saved itineraries.",
        });
    } finally {
        setLoadingItineraries(false);
        setIsFetchingMore(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchItineraries();
    }
  }, [user, fetchItineraries]);

  useEffect(() => {
    if (itineraryToEdit) {
      setNewTitle(itineraryToEdit.title);
    }
  }, [itineraryToEdit]);

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
    router.push('/');
  };

  const confirmDelete = async () => {
    if (!itineraryToDelete || !user) return;
    
    const db = getFirestore();
    const docRef = doc(db, 'users', user.uid, 'itineraries', itineraryToDelete);
    
    deleteDoc(docRef)
      .then(() => {
        toast({
          title: 'Itinerary Deleted',
          description: 'Your trip has been successfully removed.',
        });
        // Refetch the list to reflect deletion
        fetchItineraries();
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setItineraryToDelete(null);
      });
  };

  const handleSaveTitle = async () => {
    if (!itineraryToEdit || !user || !newTitle.trim()) return;

    setIsSaving(true);
    const db = getFirestore();
    const docRef = doc(db, 'users', user.uid, 'itineraries', itineraryToEdit.id);
    
    const updatedData = {
      title: newTitle.trim(),
      'itineraryData.title': newTitle.trim() // Also update the nested title
    };

    updateDoc(docRef, updatedData)
      .then(() => {
        toast({
          title: 'Title Updated',
          description: 'Your itinerary name has been changed.',
        });
        setItineraries(prev => 
          prev.map(it => it.id === itineraryToEdit.id ? { ...it, title: newTitle.trim(), itineraryData: { ...it.itineraryData, title: newTitle.trim() }} : it)
        );
        setItineraryToEdit(null);
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updatedData
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  if (userLoading || (!user && !userLoading)) {
    return (
        <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-8 w-1/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
      </div>
    )
  }

  const handleItineraryClick = (itinerary: SavedItineraryDocument) => {
    sessionStorage.setItem('selectedItinerary', JSON.stringify(itinerary.itineraryData));
    router.push(`/itinerary`);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              {user && <p className="text-muted-foreground">Welcome back, {user.email}</p>}
          </div>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Saved Itineraries</CardTitle>
            <CardDescription>Here are all the amazing trips you've planned. Click one to view it, or delete it.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingItineraries && itineraries.length === 0 ? (
               <Loader2 className="animate-spin mx-auto my-8" size={32} />
            ) : itineraries.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {itineraries.map((trip) => (
                    <Card key={trip.id} className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl h-full flex flex-col">
                      <CardContent className="p-5 flex flex-col flex-grow">
                          <h2 className="text-xl font-semibold mb-2 line-clamp-2">{trip.title}</h2>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                           {trip.destination}
                          </p>
                          <div className="flex-grow" />
                          <div className="flex items-center gap-2 mt-4">
                            <Button className="w-full bg-primary text-primary-foreground py-2 rounded-xl hover:bg-primary/90 transition-all" onClick={() => handleItineraryClick(trip)}>
                                View Full Itinerary
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setItineraryToEdit(trip);
                                }}
                                className="flex-shrink-0"
                            >
                                <Edit className="h-5 w-5" />
                            </Button>
                             <Button
                                variant="destructive"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setItineraryToDelete(trip.id);
                                }}
                                className="flex-shrink-0"
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {hasMore && (
                    <div className="mt-8 text-center">
                        <Button onClick={() => fetchItineraries(lastDoc)} disabled={isFetchingMore}>
                            {isFetchingMore ? <Loader2 className="animate-spin mr-2" /> : null}
                            Load More
                        </Button>
                    </div>
                )}
              </>
            ) : (
              <p>You haven't saved any itineraries yet. Go plan a trip!</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <AlertDialog open={!!itineraryToDelete} onOpenChange={(isOpen) => !isOpen && setItineraryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              saved itinerary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItineraryToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!itineraryToEdit} onOpenChange={(isOpen) => !isOpen && setItineraryToEdit(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Itinerary Name</DialogTitle>
            </DialogHeader>
            <div className="py-4">
                <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Enter new itinerary title"
                    className="w-full"
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" onClick={() => setItineraryToEdit(null)}>Cancel</Button>
                </DialogClose>
                <Button onClick={handleSaveTitle} disabled={isSaving || !newTitle.trim()}>
                    {isSaving ? <Loader2 className="animate-spin mr-2" /> : null}
                    Save
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
