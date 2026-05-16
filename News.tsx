import React, { useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, ExternalLink, Filter } from "lucide-react";
import { useGetSpaceNews } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORY_COLOR: Record<string, string> = {
  nasa: "text-blue-400 border-blue-400/50 bg-blue-400/10",
  isro: "text-orange-400 border-orange-400/50 bg-orange-400/10",
  spacex: "text-emerald-400 border-emerald-400/50 bg-emerald-400/10",
  esa: "text-purple-400 border-purple-400/50 bg-purple-400/10",
  general: "text-muted-foreground border-white/10 bg-white/5",
};

export default function News() {
  const [category, setCategory] = useState("");
  const params: Record<string, string> = {};
  if (category && category !== "all") params.category = category;
  const { data: articles, isLoading } = useGetSpaceNews(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold font-mono neon-text tracking-widest">SPACE NEWS</h1>
          <p className="text-muted-foreground text-sm mt-1 font-mono">DEEP SPACE INTELLIGENCE FEED</p>
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48 bg-black/40 border-white/10 font-mono">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter agency" />
          </SelectTrigger>
          <SelectContent className="bg-background/95 border-white/10">
            <SelectItem value="all">All Agencies</SelectItem>
            <SelectItem value="nasa">NASA</SelectItem>
            <SelectItem value="isro">ISRO</SelectItem>
            <SelectItem value="spacex">SpaceX</SelectItem>
            <SelectItem value="esa">ESA</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-72 rounded-lg glass-panel animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(articles ?? []).map((a: any, i: number) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-panel border-white/5 hover:border-primary/20 transition-all duration-300 overflow-hidden group h-full flex flex-col">
                {a.imageUrl && (
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={a.imageUrl}
                      alt={a.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    <Badge className={`absolute top-3 left-3 text-xs font-mono uppercase border ${CATEGORY_COLOR[a.category] ?? ""}`}>
                      {a.source}
                    </Badge>
                  </div>
                )}
                <CardContent className="p-5 flex-1 flex flex-col">
                  <h3 className="font-mono font-bold text-sm leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">{a.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1 line-clamp-3">{a.summary}</p>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-muted-foreground/50 font-mono">
                      {new Date(a.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <a href={a.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="text-xs font-mono text-muted-foreground hover:text-primary h-7 px-2">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        READ MORE
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
