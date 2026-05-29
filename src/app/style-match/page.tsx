"use client";

import { useState } from "react";
import { styleMatchAdvisor, type StyleMatchAdvisorOutput } from "@/ai/flows/style-match-advisor";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2, Sofa, Lamp, Home, Layout, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StyleMatchPage() {
  const [roomDescription, setRoomDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StyleMatchAdvisorOutput | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomDescription.trim()) return;

    setLoading(true);
    try {
      const response = await styleMatchAdvisor({ roomDescription });
      setResult(response);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1">GEN AI INTERIOR DESIGN</Badge>
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">StyleMatch Advisor</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Describe your room layout, current furniture, or your dream aesthetic, and our AI will curate the perfect collection of furniture and appliances for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-none shadow-xl bg-primary text-white overflow-hidden relative">
              <Sparkles className="absolute -top-6 -right-6 h-32 w-32 text-white/10 rotate-12" />
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Room Description</CardTitle>
                <CardDescription className="text-white/70">Tell us about your space...</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Textarea 
                    placeholder="E.g. My living room is small with light oak floors and large windows. I want a minimalist look with a focus on comfort and high-tech kitchen integration."
                    className="min-h-[200px] bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-accent"
                    value={roomDescription}
                    onChange={(e) => setRoomDescription(e.target.value)}
                  />
                  <Button 
                    type="submit" 
                    disabled={loading || !roomDescription} 
                    className="w-full bg-accent hover:bg-accent/90 text-white h-12 text-lg font-bold"
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Space...</>
                    ) : (
                      "Generate Recommendations"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="p-6 bg-secondary/30 rounded-2xl border">
              <h4 className="font-bold flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" /> How it works
              </h4>
              <ul className="text-sm space-y-3 text-muted-foreground">
                <li className="flex gap-2"><span className="font-bold text-primary">1.</span> Detail your space's size, color, and current vibe.</li>
                <li className="flex gap-2"><span className="font-bold text-primary">2.</span> Our AI analyzes design trends and Dwello's catalog.</li>
                <li className="flex gap-2"><span className="font-bold text-primary">3.</span> Get personalized pairings of furniture and tech.</li>
              </ul>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-7">
            {result ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Style Analysis */}
                <Card className="border-none shadow-lg">
                  <CardHeader className="bg-secondary/20 border-b">
                    <CardTitle className="flex items-center gap-2 font-headline">
                      <Layout className="h-5 w-5 text-primary" /> Style Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed italic">
                      "{result.overallStyleAnalysis}"
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Furniture */}
                  <div className="space-y-4">
                    <h3 className="font-headline font-bold text-xl flex items-center gap-2">
                      <Sofa className="h-5 w-5 text-primary" /> Furniture Picks
                    </h3>
                    {result.furnitureRecommendations.map((item, idx) => (
                      <Card key={idx} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <Badge variant="outline" className="mb-2 text-[10px] uppercase tracking-tighter">{item.style}</Badge>
                          <h4 className="font-bold mb-1">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.reasoning}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Appliances */}
                  <div className="space-y-4">
                    <h3 className="font-headline font-bold text-xl flex items-center gap-2">
                      <Lamp className="h-5 w-5 text-primary" /> Appliance Tech
                    </h3>
                    {result.applianceRecommendations.map((item, idx) => (
                      <Card key={idx} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <Badge variant="outline" className="mb-2 text-[10px] uppercase tracking-tighter">{item.style}</Badge>
                          <h4 className="font-bold mb-1">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.reasoning}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <Card className="border-none shadow-lg bg-accent/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-accent">
                      <ListChecks className="h-5 w-5" /> Pro Designer Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.styleTips.map((tip, idx) => (
                        <li key={idx} className="text-sm flex gap-2 items-start">
                          <div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="h-full min-h-[500px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <div className="p-4 bg-secondary rounded-full mb-6">
                  <Home className="h-12 w-12 opacity-20" />
                </div>
                <h3 className="text-2xl font-headline font-bold text-foreground/50 mb-2">No recommendations yet</h3>
                <p className="max-w-xs mx-auto">Fill out the room description to see how AI can transform your living space.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}