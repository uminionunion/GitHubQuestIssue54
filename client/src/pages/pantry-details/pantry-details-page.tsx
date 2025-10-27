
import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Pantry } from '../home/types';

interface PantryDetailsPageProps {
  pantries: Pantry[];
}

export function PantryDetailsPage({ pantries }: PantryDetailsPageProps) {
  const { id } = useParams<{ id: string }>();
  const pantry = pantries.find(p => p.id === Number(id));

  const [showCommentBox, setShowCommentBox] = React.useState(false);

  if (!pantry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-slate-900 text-foreground flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Pantry not found</h2>
        <Button asChild>
          <Link to="/">Back to Map</Link>
        </Button>
      </div>
    );
  }

  const handleVote = () => {
    setShowCommentBox(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-slate-900 text-foreground p-4 md:p-8">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Button asChild variant="outline">
          <Link to="/">← Back to Map</Link>
        </Button>
      </header>
      <main className="container mx-auto">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{pantry.name}</CardTitle>
            <CardDescription>{pantry.address}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">Hours of Operation</h4>
              <p>{pantry.hours}</p>
            </div>
            <div>
              <h4 className="font-semibold">Notes</h4>
              <p>{pantry.notes}</p>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">Vouched for?</span>
              <Button variant="ghost" size="icon" onClick={handleVote}>
                <ThumbsUp className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleVote}>
                <ThumbsDown className="h-5 w-5" />
              </Button>
            </div>
            {showCommentBox && (
              <div className="w-full space-y-2">
                <Label htmlFor="comment">Leave a comment? (optional)</Label>
                <Textarea id="comment" placeholder="Share your experience..." maxLength={500} />
                <Button>Submit Feedback</Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
