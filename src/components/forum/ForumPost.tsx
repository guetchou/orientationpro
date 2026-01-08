
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, MessageSquare, Share2 } from "lucide-react";
import { ForumPost as IForumPost, ForumReply } from "@/types/forum";

interface ForumPostProps {
  post: IForumPost;
  replies?: ForumReply[];
}

export const ForumPost = ({ post, replies = [] }: ForumPostProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleSubmitReply = () => {
    // Logique pour soumettre la réponse
    console.log("Réponse soumise:", replyContent);
    setReplyContent("");
    setIsReplying(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src="/avatars/avatar-1.jpg" />
              <AvatarFallback>AU</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{post.title}</CardTitle>
              <p className="text-sm text-gray-500">
                Posté le {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <ThumbsUp className="w-4 h-4 mr-2" />
              {post.likes}
            </Button>
            <Button variant="ghost" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              {post.replies_count}
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none mb-6">
          <p>{post.content}</p>
        </div>

        <div className="space-y-4">
          {replies.map((reply) => (
            <Card key={reply.id}>
              <CardContent className="py-4">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src="/avatars/avatar-2.jpg" />
                    <AvatarFallback>RP</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-500">
                        Répondu le {new Date(reply.created_at).toLocaleDateString()}
                      </p>
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        {reply.likes}
                      </Button>
                    </div>
                    <p className="mt-2">{reply.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {isReplying ? (
          <div className="mt-6 space-y-4">
            <Textarea
              placeholder="Votre réponse..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleSubmitReply}>Répondre</Button>
              <Button variant="ghost" onClick={() => setIsReplying(false)}>
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => setIsReplying(true)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Répondre
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
