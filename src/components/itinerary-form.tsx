
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ItinerarySchema } from "@/lib/types";
import { getPlaceAutocomplete } from "@/ai/flows/get-place-autocomplete";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


type ItineraryFormProps = {
  onItineraryGenerated: (data: z.infer<typeof ItinerarySchema>) => void;
};

const interests = [
  { id: "cultural_heritage", label: "Cultural Heritage" },
  { id: "nightlife", label: "Nightlife" },
  { id: "adventure", label: "Adventure" },
  { id: "foodie", label: "Foodie Tour" },
  { id: "relaxation", label: "Relaxation" },
  { id: "nature", label: "Nature & Outdoors" },
];

const moods = [
    { id: "calm", label: "Calm" },
    { id: "inspired", label: "Inspired" },
    { id: "exhilarated", label: "Exhilarated" },
    { id: "connected", label: "Connected" },
    { id: "social", label: "Social" },
    { id: "spontaneous", label: "Spontaneous" },
];


export function ItineraryForm({ onItineraryGenerated }: ItineraryFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [autofillValue, setAutofillValue] = useState("");

  const form = useForm<z.infer<typeof ItinerarySchema>>({
    resolver: zodResolver(ItinerarySchema),
    defaultValues: {
      destination: "",
      budget: 50000,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      interests: ["cultural_heritage"],
      moods: ["inspired"],
    },
  });

  const startDate = form.watch("startDate");
  const destinationValue = form.watch("destination");

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (destinationValue.length > 2) {
        try {
          const result = await getPlaceAutocomplete({ query: destinationValue });
          const predictions = result.predictions;
          setSuggestions(predictions);
          if (predictions.length > 0 && predictions[0].toLowerCase().startsWith(destinationValue.toLowerCase())) {
            setAutofillValue(predictions[0]);
          } else {
            setAutofillValue("");
          }
          setShowSuggestions(true);
        } catch (error) {
          console.error("Failed to fetch suggestions:", error);
          setSuggestions([]);
          setAutofillValue("");
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setAutofillValue("");
      }
    };

    const debounceTimeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimeout);
  }, [destinationValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: any) => {
    if (e.key === 'Tab' && autofillValue) {
        e.preventDefault();
        field.onChange(autofillValue);
        setAutofillValue('');
        setShowSuggestions(false);
    }
  };

  async function onSubmit(data: z.infer<typeof ItinerarySchema>) {
    setIsLoading(true);
    setShowSuggestions(false);
    try {
      onItineraryGenerated(data);
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Navigation Failed",
        description: "Could not proceed to the itinerary page.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 text-foreground">
        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination</FormLabel>
              <FormControl>
                <div className="relative">
                   <Input
                    placeholder="e.g., Goa, India"
                    {...field}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                    onFocus={() => destinationValue.length > 2 && setShowSuggestions(true)}
                    onKeyDown={(e) => handleKeyDown(e, field)}
                    autoComplete="off"
                    className="bg-card/20 text-foreground placeholder:text-foreground/70 border-foreground/30"
                  />
                  {autofillValue && destinationValue && autofillValue.toLowerCase().startsWith(destinationValue.toLowerCase()) && (
                    <div className="absolute inset-0 px-3 py-2 pointer-events-none text-foreground">
                      <span className="text-transparent">{destinationValue}</span>
                      <span className="text-muted-foreground">
                        {autofillValue.substring(destinationValue.length)}
                      </span>
                    </div>
                  )}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-card/90 text-foreground backdrop-blur-sm border rounded-md mt-1 shadow-lg">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-2 hover:bg-muted/60 cursor-pointer"
                          onMouseDown={() => {
                            field.onChange(suggestion);
                            setShowSuggestions(false);
                            setAutofillValue("");
                          }}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget (INR)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 50000" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} className="bg-card/20 text-foreground placeholder:text-foreground/70 border-foreground/30" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal bg-card/20 text-foreground hover:bg-card/30 border-foreground/30",
                          !field.value && "text-foreground/70"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "LLL dd, y")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                           "w-full pl-3 text-left font-normal bg-card/20 text-foreground hover:bg-card/30 border-foreground/30",
                          !field.value && "text-foreground/70"
                        )}
                        disabled={!startDate}
                      >
                        {field.value ? (
                          format(field.value, "LLL dd, y")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                       disabled={(date) => date < startDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Tabs defaultValue="interests" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="interests">Interests</TabsTrigger>
                <TabsTrigger value="moods">Moods</TabsTrigger>
            </TabsList>
            <TabsContent value="interests">
                 <FormField
                    control={form.control}
                    name="interests"
                    render={() => (
                        <FormItem>
                        <div className="grid grid-cols-2 gap-2 pt-4">
                        {interests.map((item) => (
                            <FormField
                            key={item.id}
                            control={form.control}
                            name="interests"
                            render={({ field }) => {
                                return (
                                <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-3 bg-card/20 border border-foreground/30"
                                >
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== item.id
                                                )
                                            );
                                        }}
                                        className="border-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal text-sm">
                                    {item.label}
                                    </FormLabel>
                                </FormItem>
                                );
                            }}
                            />
                        ))}
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </TabsContent>
            <TabsContent value="moods">
                 <FormField
                    control={form.control}
                    name="moods"
                    render={() => (
                        <FormItem>
                            <div className="grid grid-cols-2 gap-2 pt-4">
                            {moods.map((item) => (
                                <FormField
                                key={item.id}
                                control={form.control}
                                name="moods"
                                render={({ field }) => {
                                    return (
                                    <FormItem
                                        key={item.id}
                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-3 bg-card/20 border border-foreground/30"
                                    >
                                        <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(item.id)}
                                            onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...field.value, item.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                    (value) => value !== item.id
                                                    )
                                                );
                                            }}
                                            className="border-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                        />
                                        </FormControl>
                                        <FormLabel className="font-normal text-sm">
                                        {item.label}
                                        </FormLabel>
                                    </FormItem>
                                    );
                                }}
                                />
                            ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </TabsContent>
        </Tabs>
        
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate Itinerary"}
          <Sparkles className="ml-2 h-4 w-4"/>
        </Button>
      </form>
    </Form>
  );
}
