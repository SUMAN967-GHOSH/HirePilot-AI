'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface JDInputPanelProps {
  jdText: string;
  setJdText: (text: string) => void;
  jdUrl: string;
  setJdUrl: (url: string) => void;
  company: string;
  setCompany: (val: string) => void;
  role: string;
  setRole: (val: string) => void;
}

export function JDInputPanel({
  jdText, setJdText, jdUrl, setJdUrl, company, setCompany, role, setRole
}: JDInputPanelProps) {
  return (
    <Card className="w-full bg-card/50 backdrop-blur border-border p-6 flex flex-col min-h-[300px]">
      <h3 className="text-xl font-medium mb-6 text-card-foreground">💼 Job Description</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="company" className="text-muted-foreground">Company</Label>
          <Input 
            id="company" 
            placeholder="e.g. Acme Corp" 
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="bg-background border-border text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role" className="text-muted-foreground">Role</Label>
          <Input 
            id="role" 
            placeholder="e.g. Senior Frontend Engineer" 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-background border-border text-foreground"
          />
        </div>
      </div>

      <Tabs defaultValue="text" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 bg-background/50 border border-border mb-4 p-1">
          <TabsTrigger value="text" className="data-[state=active]:bg-muted data-[state=active]:text-primary rounded-sm">Paste Text</TabsTrigger>
          <TabsTrigger value="url" className="data-[state=active]:bg-muted data-[state=active]:text-primary rounded-sm">From URL</TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="flex-1 mt-0">
          <Textarea 
            placeholder="Paste the full job description here..."
            className="w-full h-full min-h-[160px] bg-background border-border text-foreground resize-none"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />
        </TabsContent>
        
        <TabsContent value="url" className="flex-1 mt-0">
          <div className="space-y-4 pt-4">
            <Label htmlFor="url" className="text-muted-foreground">Job Posting URL</Label>
            <Input 
              id="url" 
              type="url"
              placeholder="https://company.com/careers/job-123" 
              value={jdUrl}
              onChange={(e) => setJdUrl(e.target.value)}
              className="bg-background border-border text-foreground"
            />
            <p className="text-xs text-muted-foreground/70">
              We&apos;ll automatically extract the job details from the provided URL.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
