
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Waves, MapPin, Send, Eye, Star } from "lucide-react";
import { ScrollAnimation } from "@/components/scroll-animation";
import placeholderImages from "@/lib/placeholder-images.json";
import ScrambleText from "@/components/scramble-text";
import DotGrid from "@/components/dot-grid";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import RotatingText from "@/components/RotatingText";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Destination = {
  name: string;
  image: { src: string; alt: string; 'data-ai-hint': string };
  gallery: { src: string; alt: string; 'data-ai-hint': string }[];
  popularSpots: { name: string; description: string }[];
};

const topDestinations: Destination[] = [
  placeholderImages.paris,
  placeholderImages.kyoto,
  placeholderImages.bali,
  placeholderImages.rome,
  placeholderImages.newYork,
  placeholderImages.london,
  placeholderImages.sydney,
  placeholderImages.dubai,
];

export default function Home() {
  const router = useRouter();
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  
  return (
    <div className="flex flex-col min-h-screen bg-background font-body text-foreground">
        
      <main className="flex-grow">
      
        {/* Hero Section */}
        <section
          className="relative h-[90vh] flex flex-col items-center justify-center text-center text-white overflow-hidden bg-black"
        >
            <Image
                src={placeholderImages.map.src}
                alt={placeholderImages.map.alt}
                fill
                style={{objectFit: 'cover'}}
                className="opacity-30"
                data-ai-hint={placeholderImages.map['data-ai-hint']}
            />
          <DotGrid
            dotSize={2}
            gap={25}
            baseColor="#020000"
            activeColor="#ffffff"
            proximity={100}
            className="z-0"
          />
         
          <div className="relative z-10 p-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow-2xl font-headline-serif max-w-4xl">
              Your next story is waiting. Let's write it together.
            </h1>
            <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-xl">
              Stop searching. Start discovering. Your personal AI travel companion is here.
            </p>
            <div className="star-border-container mt-10">
              <div className="border-gradient-top"></div>
              <div className="border-gradient-bottom"></div>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 live-button" onClick={() => router.push('/planner')}>
                 <span className="btn-shine">Start Dreaming</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-32 bg-background">
            <div className="container mx-auto px-4">
                {/* From Chaos to Canvas */}
                <ScrollAnimation>
                    <div className="text-center max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline-serif">Your travel planning deserves to be as beautiful as the journey itself.</h2>
                        <p className="mt-6 text-lg text-foreground/80 max-w-2xl mx-auto">
                            Forget the endless tabs and conflicting advice. Sanchari listens to your desires—a feeling, a craving, a whisper of an idea—and transforms it into a single, interactive travel story.
                        </p>
                    </div>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="p-8 border rounded-lg bg-card text-card-foreground shadow-2xl">
                            <h3 className="font-bold text-lg">The Old Way: Chaos</h3>
                            <p className="text-sm text-muted-foreground mt-1">Juggling tabs, spreadsheets, and notes.</p>
                            <div className="mt-4 space-y-2 text-sm opacity-75">
                                <div className="p-2 border rounded-md">1. Search "best places to visit..."</div>
                                <div className="p-2 border rounded-md">2. Open 15 tabs of travel blogs</div>
                                <div className="p-2 border rounded-md">3. Create a spreadsheet for budget</div>
                                <div className="p-2 border rounded-md">4. Check map for distances</div>
                                <div className="p-2 border rounded-md">5. Repeat for hotels and flights...</div>
                            </div>
                        </div>
                        <div className="relative h-80 rounded-lg shadow-2xl overflow-hidden">
                             <Image
                                src={placeholderImages.canvas.src}
                                alt={placeholderImages.canvas.alt}
                                fill
                                style={{objectFit: 'cover'}}
                                className="brightness-90"
                                data-ai-hint={placeholderImages.canvas['data-ai-hint']}
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-6 flex flex-col justify-end">
                                <h3 className="font-bold text-lg text-white">The Sanchari Way: Canvas</h3>
                                <p className="text-sm text-white/80 mt-1">A single, fluid, interactive travel story.</p>
                             </div>
                        </div>
                    </div>
                </ScrollAnimation>

                {/* How it Works */}
                <ScrollAnimation className="mt-24 md:mt-32">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        <div>
                            <div className="flex items-center justify-center h-16 w-16 bg-primary/10 text-primary rounded-full mx-auto">
                                <Waves className="w-8 h-8" />
                            </div>
                            <h3 className="mt-6 text-xl font-semibold">Whisper Your Dream</h3>
                            <p className="mt-2 text-muted-foreground">Tell Sanchari anything—a destination, a mood, or an activity. There are no wrong answers.</p>
                        </div>
                        <div>
                            <div className="flex items-center justify-center h-16 w-16 bg-primary/10 text-primary rounded-full mx-auto">
                                <MapPin className="w-8 h-8" />
                            </div>
                            <h3 className="mt-6 text-xl font-semibold">Watch it Unfold</h3>
                            <p className="mt-2 text-muted-foreground">See your journey come to life on an interactive canvas, intelligently crafted for you in seconds.</p>
                        </div>
                        <div>
                            <div className="flex items-center justify-center h-16 w-16 bg-primary/10 text-primary rounded-full mx-auto">
                                <Send className="w-8 h-8" />
                            </div>
                            <h3 className="mt-6 text-xl font-semibold">Journey with Confidence</h3>
                            <p className="mt-2 text-muted-foreground">Book everything with a single tap and travel with a wise co-pilot in your pocket, adapting to every moment.</p>
                        </div>
                    </div>
                </ScrollAnimation>

                {/* Testimonials */}
                <ScrollAnimation className="mt-24 md:mt-32">
                    <div className="text-center max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline-serif">We don't just build itineraries. We write stories.</h2>
                    </div>
                    <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <div className="aspect-w-4 aspect-h-3 relative overflow-hidden rounded-lg">
                                <Image src={placeholderImages.story1.src} alt={placeholderImages.story1.alt} fill style={{objectFit: 'cover'}} data-ai-hint={placeholderImages.story1['data-ai-hint']} />
                            </div>
                            <p className="font-style: italic text-muted-foreground">"Priya discovered a hidden surf school in Varkala."</p>
                        </div>
                         <div className="space-y-4">
                            <div className="aspect-w-4 aspect-h-3 relative overflow-hidden rounded-lg">
                                <Image src={placeholderImages.story2.src} alt={placeholderImages.story2.alt} fill style={{objectFit: 'cover'}} data-ai-hint={placeholderImages.story2['data-ai-hint']} />
                            </div>
                            <p className="font-style: italic text-muted-foreground">"Rohan's foodie tour through Old Delhi was planned to the last bite."</p>
                        </div>
                         <div className="space-y-4">
                            <div className="aspect-w-4 aspect-h-3 relative overflow-hidden rounded-lg">
                                <Image src={placeholderImages.story3.src} alt={placeholderImages.story3.alt} fill style={{objectFit: 'cover'}} data-ai-hint={placeholderImages.story3['data-ai-hint']} />
                            </div>
                            <p className="font-style: italic text-muted-foreground">"Ananya wanted a silent retreat. Sanchari found her a monastery in the Himalayas."</p>
                        </div>
                    </div>
                </ScrollAnimation>

                {/* Top Destinations Section */}
                <ScrollAnimation className="mt-24 md:mt-32">
                    <div className="text-center max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline-serif">Explore Top Destinations</h2>
                        <p className="mt-6 text-lg text-foreground/80 max-w-2xl mx-auto">
                            Get inspired by the places travelers are loving right now.
                        </p>
                    </div>
                    <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {topDestinations.map((destination) => (
                            <Card key={destination.name} className="overflow-hidden group cursor-pointer" onClick={() => setSelectedDestination(destination)}>
                                <div className="relative aspect-h-4 aspect-w-3">
                                    <Image
                                        src={destination.image.src}
                                        alt={destination.image.alt}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        className="transition-transform duration-500 group-hover:scale-110"
                                        data-ai-hint={destination.image['data-ai-hint']}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="p-2 bg-background/50 backdrop-blur-sm rounded-full">
                                        <Eye className="w-8 h-8 text-white"/>
                                      </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 p-6">
                                        <h3 className="text-xl font-bold text-white">{destination.name}</h3>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </ScrollAnimation>


                {/* Final CTA */}
                <ScrollAnimation className="mt-24 md:mt-32 text-center">
                    <div className="flex items-baseline justify-center translate-x-4">
                        <h2 className="text-4xl md:text-5xl font-bold font-headline-serif">We Create&nbsp;</h2>
                        <RotatingText
                        texts={['Itineraries', 'Stories', 'Memories']}
                        mainClassName="text-4xl md:text-5xl font-bold font-headline-serif text-black dark:text-white w-[250px]"
                        staggerFrom={"last"}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-120%" }}
                        staggerDuration={0.025}
                        splitBy="words"
                        splitLevelClassName="overflow-hidden"
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        rotationInterval={2000}
                        />
                    </div>
                     <div className="star-border-container mt-8">
                        <div className="border-gradient-top"></div>
                        <div className="border-gradient-bottom"></div>
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 live-button" onClick={() => router.push('/planner')}>
                            <span className="btn-shine">Start Dreaming</span>
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </ScrollAnimation>

                  
            </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto py-6 text-center text-sm text-muted-foreground">
             <Link href="/about">
                <ScrambleText className="text-2xl font-bold font-display-heavy uppercase" text="5tack" />
             </Link>
        </div>
      </footer>

      {selectedDestination && (
        <Dialog open={!!selectedDestination} onOpenChange={(isOpen) => !isOpen && setSelectedDestination(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedDestination.name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              <div>
                <Carousel className="w-full">
                  <CarouselContent>
                    {selectedDestination.gallery.map((img, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-w-16 aspect-h-9">
                          <Image
                            src={img.src}
                            alt={img.alt}
                            fill
                            style={{ objectFit: 'cover' }}
                            className="rounded-lg"
                            data-ai-hint={img['data-ai-hint']}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Popular Spots</h3>
                <div className="space-y-4">
                  {selectedDestination.popularSpots.map((spot, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-primary mt-1 flex-shrink-0"/>
                      <div>
                        <h4 className="font-semibold">{spot.name}</h4>
                        <p className="text-sm text-muted-foreground">{spot.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
