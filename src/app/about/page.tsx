
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import placeholderImages from '@/lib/placeholder-images.json';
import Prism from '@/components/Prism';
import ScrambleText from '@/components/scramble-text';
import ScrollFloat from '@/components/ScrollFloat';
import { Github, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const teamMembers = [
  {
    name: 'Deshwanth Somashekhar',
    image: placeholderImages.teamMember1,
    linkedinUrl: 'https://www.linkedin.com/in/deshwanth-shetty/',
    githubUrl: 'https://github.com/deshwanths',
  },
  {
    name: 'Parinith R',
    image: placeholderImages.teamMember2,
    linkedinUrl: 'https://www.linkedin.com/in/parinith-r/',
    githubUrl: 'https://github.com/parinith-png',
  },
  {
    name: 'DAIVIK BM',
    image: placeholderImages.teamMember3,
    linkedinUrl: 'https://www.linkedin.com/in/daivik-b-m-052455291/',
    githubUrl: '#',
  },
  {
    name: 'Abhishek M V',
    image: placeholderImages.teamMember4,
    linkedinUrl: '#',
    githubUrl: '#',
  },
  {
    name: 'Manoj Shetty',
    image: placeholderImages.teamMember5,
    linkedinUrl: '#',
    githubUrl: '#',
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body text-foreground">
       <section
          className="relative h-[40vh] flex flex-col items-center justify-center text-center text-white overflow-hidden bg-black"
        >
          <Prism noise={0.5} />
          <div className="relative z-10 p-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow-2xl font-display-heavy uppercase max-w-4xl">
              <ScrambleText text="5TACK" />
            </h1>
            <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-xl">
              The team behind the innovation.
            </p>
          </div>
        </section>

      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto">
          <ScrollFloat containerClassName="text-3xl md:text-4xl font-bold font-headline-serif">Meet the Innovators</ScrollFloat>
          <p className="mt-4 text-lg text-muted-foreground">
            We are a passionate team of developers, designers, and strategists dedicated to building the future of travel technology.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {teamMembers.map((member, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                 <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-primary/20">
                    <Image
                        src={member.image.src}
                        alt={member.image.alt}
                        fill
                        style={{ objectFit: 'cover' }}
                        data-ai-hint={member.image['data-ai-hint']}
                    />
                 </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-xl">{member.name}</CardTitle>
                <div className="mt-4 flex justify-center gap-2">
                  <Button asChild variant="ghost" size="icon">
                    <Link href={member.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-5 w-5" />
                      <span className="sr-only">LinkedIn</span>
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="icon">
                    <Link href={member.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-5 w-5" />
                      <span className="sr-only">GitHub</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
