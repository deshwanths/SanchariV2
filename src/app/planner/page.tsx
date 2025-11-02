
"use client";

import { useState, useEffect, useRef } from "react";
import { FormProvider, useForm, useFormContext, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { z } from "zod";
import { ItinerarySchema } from "@/lib/types";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getPlaceAutocomplete } from "@/ai/flows/get-place-autocomplete";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Backpack,
  Briefcase,
  CalendarIcon,
  Diamond,
  Heart,
  Landmark,
  Map,
  Moon,
  Mountain,
  UtensilsCrossed,
  Wallet,
  Sparkles,
  Languages,
  PlaneTakeoff,
  Upload,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";
import placeholderImages from "@/lib/placeholder-images.json";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";


// #region --- Form Schema and Types ---
const VIBES = {
  interests: [
    { id: "cultural_heritage", label: "Heritage", icon: Landmark },
    { id: "adventure", label: "Adventure", icon: Mountain },
    { id: "foodie", label: "Foodie", icon: UtensilsCrossed },
    { id: "nightlife", label: "Nightlife", icon: Moon },
  ],
  moods: [
    { id: "relaxation", label: "Relaxation", icon: Heart },
    { id: "social", label: "Social", icon: Briefcase },
  ]
};

const LANGUAGES = [
    { id: 'english', label: 'English' },
    { id: 'hindi', label: 'Hindi' },
    { id: 'bengali', label: 'Bengali' },
    { id: 'telugu', label: 'Telugu' },
    { id: 'marathi', label: 'Marathi' },
    { id: 'tamil', label: 'Tamil' },
    { id: 'urdu', label: 'Urdu' },
    { id: 'gujarati', label: 'Gujarati' },
    { id: 'kannada', label: 'Kannada' },
    { id: 'malayalam', label: 'Malayalam' },
];

const TRAVEL_STYLES = [
  { id: 'budget', label: 'Budget-Savvy', icon: Backpack, description: 'Approx. < ₹5000/day' },
  { id: 'comfortable', label: 'Comfortable', icon: Wallet, description: 'Approx. ₹5000-₹15000/day' },
  { id: 'luxury', label: 'Luxury', icon: Diamond, description: 'Approx. > ₹15000/day' },
];

type FormData = z.infer<typeof ItinerarySchema>;
// #endregion

// #region --- Step Management Hook ---
function useStep() {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev > 0 ? prev - 1 : 0);

  return { currentStep, nextStep, prevStep };
}
// #endregion

// #region --- Main Planner Page Component ---
export default function PlannerPage() {
  const router = useRouter();
  const { currentStep, nextStep, prevStep } = useStep();

  const methods = useForm<FormData>({
    resolver: zodResolver(ItinerarySchema),
    defaultValues: {
      destination: "",
      startingLocation: "",
      travelStyle: 'comfortable',
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      interests: [],
      moods: [],
      languages: ['english'],
      photoDataUri: undefined,
    },
  });

  const handleFormSubmit = (data: FormData) => {
    // Convert dates to string format for storage
    const serializableData = {
      ...data,
      startDate: format(data.startDate, 'yyyy-MM-dd'),
      endDate: format(data.endDate, 'yyyy-MM-dd'),
    };
    sessionStorage.setItem('itineraryQuery', JSON.stringify(serializableData));
    router.push('/itinerary');
  };

  const STEPS: React.ReactNode[] = [
    <DestinationInput onSelected={nextStep} />,
    <StartingLocationInput onSelected={nextStep} />,
    <DateRangePicker onSelected={nextStep} />,
    <TravelStylePicker onSelected={nextStep} />,
    <VibePicker onSelected={nextStep} />,
    <LanguagePicker onSelected={nextStep} />,
    <Summary onSelected={() => methods.handleSubmit(handleFormSubmit)()} />,
  ];

  const progressPercentage = (currentStep / (STEPS.length - 1)) * 100;

  return (
    <FormProvider {...methods}>
      <div className="w-full min-h-screen relative flex items-center justify-center p-4">
        <div className="absolute inset-0">
          <Image
            src={placeholderImages.planner.src}
            alt={placeholderImages.planner.alt}
            fill
            style={{ objectFit: 'cover' }}
            className="h-full w-full object-cover"
            priority
            data-ai-hint={placeholderImages.planner['data-ai-hint']}
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative w-full max-w-xl">
           <div className="absolute top-[-80px] left-0 right-0 px-4 flex items-center">
                {currentStep > 0 && (
                    <Button onClick={prevStep} variant="ghost" size="sm" className="absolute left-[-6rem] text-white hover:text-white hover:bg-white/10">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                )}
                <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white drop-shadow-md -translate-y-4">Step {currentStep + 1} of {STEPS.length}</span>
                    </div>
                    <Progress value={progressPercentage} className="w-full h-2" />
                </div>
            </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {STEPS[currentStep]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </FormProvider>
  );
}
// #endregion

// #region --- Form Step Components ---
function DestinationInput({ onSelected }: { onSelected: () => void }) {
    const { register, setValue, watch, trigger, formState: { errors } } = useFormContext<FormData>();
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const destinationValue = watch("destination");
    const photoDataUri = watch("photoDataUri");
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;
        const fetchSuggestions = async () => {
            if (destinationValue && destinationValue.length > 2) {
                const result = await getPlaceAutocomplete({ query: destinationValue });
                setSuggestions(result.predictions);
                setShowSuggestions(true);
            } else {
                setShowSuggestions(false);
            }
        };
        const debounce = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounce);
    }, [destinationValue, isClient]);

    const handleSelect = async (value: string) => {
        setValue("destination", value, { shouldValidate: true });
        setValue("photoDataUri", undefined);
        setUploadedImageName(null);
        setShowSuggestions(false);
        const isValid = await trigger("destination");
        if (isValid) {
          onSelected();
        }
    };
    
    const handleContinue = async () => {
        const isValid = await trigger("destination");
        if (isValid) {
            setShowSuggestions(false);
            onSelected();
        } else if (!errors.destination?.message?.includes("Please either enter a destination or upload a photo")) {
             toast({
                variant: "destructive",
                title: "Please enter a destination.",
             });
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          handleImageUpload(file);
        }
    };
    
    const handleImageUpload = (file: File) => {
        setIsUploading(true);
        setUploadedImageName(file.name);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const dataUri = reader.result as string;
          setValue("photoDataUri", dataUri, { shouldValidate: true });
          setValue("destination", "Generated from image", { shouldValidate: true }); 
          setIsUploading(false);
          toast({
            title: "Image Uploaded!",
            description: "You can now proceed to the next steps.",
          });
        };
        reader.onerror = (error) => {
          console.error("Error reading file:", error);
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "Could not read the selected image file.",
          });
          setIsUploading(false);
          setUploadedImageName(null);
        };
    };

    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    const removeImage = () => {
        setValue("photoDataUri", undefined);
        setValue("destination", "", { shouldValidate: true }); // Clear dummy value
        setUploadedImageName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const canContinue = (!!destinationValue && destinationValue !== "Generated from image") || !!photoDataUri;

    return (
        <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight drop-shadow-md">
                Where will your next story begin?
            </h1>
            <p className="mt-4 text-lg text-white/80">Enter a city, country, or region...</p>
            <div className="mt-8 max-w-lg mx-auto relative">
                {isClient && (
                    <input
                        {...register("destination")}
                        type="text"
                        placeholder="e.g., Kyoto, Japan"
                        className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full h-14 px-4 text-lg focus:ring-2 focus:ring-primary outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                        autoComplete="off"
                        onFocus={() => destinationValue?.length > 2 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        disabled={!!photoDataUri}
                    />
                )}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-background/90 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg z-10 text-left">
                        {suggestions.map((s, i) => (
                            <div
                                key={i}
                                className="p-3 text-white/90 hover:bg-white/10 cursor-pointer"
                                onClick={() => handleSelect(s)}
                            >
                                {s}
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex flex-col items-center justify-center mt-6">
                    {!photoDataUri && (
                        <>
                            <div className="relative flex items-center justify-center w-full max-w-xs mx-auto my-4">
                                <div className="flex-grow border-t border-white/30"></div>
                                <span className="flex-shrink mx-4 text-white/80">or</span>
                                <div className="flex-grow border-t border-white/30"></div>
                            </div>
                            
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/jpeg,image/png,image/webp"
                                disabled={isUploading}
                            />
                            
                            <Button onClick={handleUploadButtonClick} variant="outline" className="bg-transparent text-white border-white/50 hover:bg-white/10 hover:text-white" size="lg" disabled={isUploading}>
                                {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 animate-spin" />
                                    Uploading...
                                </>
                                ) : (
                                <>
                                    <Upload className="mr-2" />
                                    Get inspired by a photo
                                </>
                                )}
                            </Button>
                            <p className="mt-2 text-xs text-white/60">The supported formats are .jpg, .png, .webp</p>
                        </>
                    )}

                    {photoDataUri && (
                        <div className="mt-4 flex items-center justify-between w-full max-w-sm p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-white">
                            <div className="flex items-center gap-2 truncate">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                                <span className="truncate">{uploadedImageName || 'Image uploaded'}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={removeImage} className="h-7 w-7 flex-shrink-0">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    
                    {errors.destination && (
                        <p className="mt-2 text-sm text-destructive">{errors.destination.message}</p>
                    )}

                    {canContinue && (
                        <Button onClick={handleContinue} className="mt-8" size="lg">Continue <ArrowRight className="ml-2" /></Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function StartingLocationInput({ onSelected }: { onSelected: () => void }) {
    const { register, setValue, watch, trigger } = useFormContext();
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const locationValue = watch("startingLocation");
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;
        const fetchSuggestions = async () => {
            if (locationValue && locationValue.length > 2) {
                const result = await getPlaceAutocomplete({ query: locationValue });
                setSuggestions(result.predictions);
                setShowSuggestions(true);
            } else {
                setShowSuggestions(false);
            }
        };
        const debounce = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounce);
    }, [locationValue, isClient]);

    const handleSelect = async (value: string) => {
        setValue("startingLocation", value, { shouldValidate: true });
        setShowSuggestions(false);
        const isValid = await trigger("startingLocation");
        if (isValid) {
          onSelected();
        }
    };
    
    const handleContinue = async () => {
        const isValid = await trigger("startingLocation");
        if (isValid) {
            setShowSuggestions(false);
            onSelected();
        } else {
             toast({
                variant: "destructive",
                title: "PLEASE SELECT AN INPUT",
             });
        }
    };

    return (
        <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight drop-shadow-md">
                And where are you starting from?
            </h1>
            <p className="mt-4 text-lg text-white/80">This helps us calculate travel time and logistics.</p>
            <div className="mt-8 max-w-lg mx-auto relative">
                {isClient && (
                    <input
                        {...register("startingLocation")}
                        type="text"
                        placeholder="e.g., Bangalore, India"
                        className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full h-14 px-4 text-lg focus:ring-2 focus:ring-primary outline-none transition"
                        autoComplete="off"
                        onFocus={() => locationValue?.length > 2 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    />
                )}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-background/90 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg z-10 text-left">
                        {suggestions.map((s, i) => (
                            <div
                                key={i}
                                className="p-3 text-white/90 hover:bg-white/10 cursor-pointer"
                                onClick={() => handleSelect(s)}
                            >
                                {s}
                            </div>
                        ))}
                    </div>
                )}
                 {locationValue && locationValue.length > 2 && (
                    <Button onClick={handleContinue} className="mt-4" size="lg">Continue <ArrowRight className="ml-2" /></Button>
                 )}
            </div>
        </div>
    );
}

function DateRangePicker({ onSelected }: { onSelected: () => void }) {
  const { watch, trigger } = useFormContext();
  const { toast } = useToast();
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const nights =
    endDate && startDate
      ? Math.round(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

  const handleContinue = async () => {
    const isStartValid = await trigger("startDate");
    const isEndValid = await trigger("endDate");
    if (isStartValid && isEndValid) {
        onSelected();
    } else {
        toast({
            variant: "destructive",
            title: "PLEASE SELECT AN INPUT",
        });
    }
  };

  return (
    <div className="text-center text-white bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold">When are you planning to travel?</h1>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start gap-2">
              <FormLabel className="text-sm font-medium text-white/80">
                Start Date
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/10 border-white/20 hover:bg-white/20",
                        !field.value && "text-white/60"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-background"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />
        <FormField
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start gap-2">
              <FormLabel className="text-sm font-medium text-white/80">
                End Date
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      disabled={!startDate}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/10 border-white/20 hover:bg-white/20",
                        !field.value && "text-white/60"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-background"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < startDate ||
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />
      </div>
      <p className="mt-4 text-white/80">Total nights selected: {nights}</p>
      <Button
        onClick={handleContinue}
        className="mt-6"
        size="lg"
        disabled={!startDate || !endDate}
      >
        Continue <ArrowRight className="ml-2" />
      </Button>
    </div>
  );
}

function TravelStylePicker({ onSelected }: { onSelected: () => void }) {
  const { setValue, watch, trigger } = useFormContext();
  const { toast } = useToast();
  const currentStyle = watch('travelStyle');

  const handleContinue = async () => {
    const isValid = await trigger("travelStyle");
    if(isValid) {
        onSelected();
    } else {
        toast({
            variant: "destructive",
            title: "PLEASE SELECT AN INPUT",
        });
    }
  };

  return (
    <div className="text-center text-white p-8">
      <h1 className="text-3xl font-bold">What’s your travel style?</h1>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {TRAVEL_STYLES.map(({ id, label, icon: Icon, description }) => (
          <div
            key={id}
            onClick={() => setValue('travelStyle', id)}
            className={cn(
              "p-6 bg-white/10 backdrop-blur-md border rounded-2xl cursor-pointer transition-all duration-300 text-center",
              currentStyle === id ? "border-primary/80 ring-2 ring-primary" : "border-white/20 hover:border-white/50"
            )}
          >
            <Icon className="h-10 w-10 mx-auto text-primary" />
            <h3 className="mt-4 text-xl font-semibold">{label}</h3>
            <p className="mt-1 text-sm text-white/70">{description}</p>
          </div>
        ))}
      </div>
       <Button onClick={handleContinue} className="mt-8" size="lg">Continue <ArrowRight className="ml-2" /></Button>
    </div>
  );
}

function VibePicker({ onSelected }: { onSelected: () => void }) {
  const { getValues, setValue, watch, trigger } = useFormContext();
  const { toast } = useToast();
  const interests: string[] = watch('interests') || [];
  const moods: string[] = watch('moods') || [];

  const handleToggle = (id: string, type: 'interests' | 'moods') => {
      const currentValues: string[] = getValues(type);
      const newValues = currentValues.includes(id)
          ? currentValues.filter(v => v !== id)
          : [...currentValues, id];
      setValue(type, newValues, { shouldValidate: true });
  };
  
  const allVibes = [
    ...VIBES.interests.map(v => ({...v, type: 'interests' as const})),
    ...VIBES.moods.map(v => ({...v, type: 'moods' as const}))
  ];

  const handleContinue = async () => {
    const isValid = await trigger("interests"); // This will also trigger validation for moods due to the schema refinement
    if(isValid) {
        onSelected();
    } else {
        toast({
            variant: "destructive",
            title: "PLEASE SELECT AN INPUT",
            description: "Please select at least one interest or mood.",
        });
    }
  };


  return (
    <div className="text-center text-white p-8">
      <h1 className="text-3xl font-bold">What's the vibe for this trip?</h1>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        {allVibes.map(({ id, label, icon: Icon, type }) => {
            const isSelected = type === 'interests' ? interests.includes(id) : moods.includes(id);
            return (
              <div
                key={id}
                onClick={() => handleToggle(id, type)}
                className={cn(
                  "p-4 flex flex-col items-center justify-center gap-2 bg-white/10 backdrop-blur-md border rounded-2xl cursor-pointer transition-all duration-300 aspect-square",
                  isSelected ? "border-primary/80 ring-2 ring-primary" : "border-white/20 hover:border-white/50"
                )}
              >
                <Icon className={cn("h-8 w-8", isSelected ? "text-primary" : "text-white/80")} />
                <span className="font-medium text-sm">{label}</span>
              </div>
            )
        })}
      </div>
       <Button onClick={handleContinue} className="mt-8" size="lg">Continue <ArrowRight className="ml-2" /></Button>
    </div>
  );
}

function LanguagePicker({ onSelected }: { onSelected: () => void }) {
  const { getValues, setValue, watch, trigger } = useFormContext();
  const { toast } = useToast();
  const selectedLanguages: string[] = watch('languages') || [];

  const handleToggle = (id: string) => {
      const currentValues: string[] = getValues('languages');
      const newValues = currentValues.includes(id)
          ? currentValues.filter(v => v !== id)
          : [...currentValues, id];
      setValue('languages', newValues, { shouldValidate: true });
  };

  const handleContinue = async () => {
    const isValid = await trigger("languages");
    if(isValid) {
        onSelected();
    } else {
        toast({
            variant: "destructive",
            title: "PLEASE SELECT AN INPUT",
             description: "Please select at least one language.",
        });
    }
  };

  return (
    <div className="text-center text-white p-8">
      <h1 className="text-3xl font-bold">Which languages do you prefer?</h1>
      <p className="mt-2 text-white/80">Select languages for recommendations and interactions.</p>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        {LANGUAGES.map(({ id, label }) => {
            const isSelected = selectedLanguages.includes(id);
            return (
              <div
                key={id}
                onClick={() => handleToggle(id)}
                className={cn(
                  "p-4 flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border rounded-2xl cursor-pointer transition-all duration-300",
                  isSelected ? "border-primary/80 ring-2 ring-primary" : "border-white/20 hover:border-white/50"
                )}
              >
                <Languages className={cn("h-5 w-5", isSelected ? "text-primary" : "text-white/80")} />
                <span className="font-medium text-sm">{label}</span>
              </div>
            )
        })}
      </div>
       <Button onClick={handleContinue} className="mt-8" size="lg">Continue <ArrowRight className="ml-2" /></Button>
    </div>
  );
}


function Summary({ onSelected }: { onSelected: () => void }) {
  const { getValues } = useFormContext<FormData>();
  const { destination, startingLocation, travelStyle, startDate, endDate, interests, moods, languages, photoDataUri } = getValues();
  
  const nights = endDate && startDate ? Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const budgetLabel = TRAVEL_STYLES.find(s => s.id === travelStyle)?.label || 'trip';

  const vibes = [...interests, ...moods];
  const tripTarget = photoDataUri ? "the location in your photo" : destination;

  return (
    <div className="text-center text-white p-8 bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl max-w-lg mx-auto">
      <h1 className="text-3xl font-bold">Ready to go?</h1>
      <p className="mt-6 text-lg text-white/90 leading-relaxed">
        Okay, planning a <span className="font-bold text-primary">{nights}-night</span> trip from <span className="font-bold text-primary">{startingLocation}</span> to <span className="font-bold text-primary">{tripTarget}</span> with a <span className="font-bold text-primary">{budgetLabel}</span> style.
        We'll focus on <span className="font-bold text-primary">{vibes.join(', ')}</span> and use <span className="font-bold text-primary">{languages.join(', ')}</span>. Sound right?
      </p>
      <Button onClick={onSelected} size="lg" className="mt-8 live-button">
        <Sparkles className="mr-2" /> Create My Itinerary
      </Button>
    </div>
  );
}

// #endregion

    