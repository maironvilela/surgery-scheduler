"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, User, Clock, Send } from "lucide-react";
import { Comment } from "@/types";

interface CommentSectionProps {
    comments?: Comment[];
    onAddComment: (comment: string) => void;
}

export function CommentSection({ comments = [], onAddComment }: CommentSectionProps) {
    const [newComment, setNewComment] = useState("");

    const handleSubmit = () => {
        if (!newComment.trim()) return;
        onAddComment(newComment);
        setNewComment("");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Comentários e Observações
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* List of Comments */}
                <div className="space-y-4">
                    {comments.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                            Nenhum comentário registrado.
                        </p>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="bg-slate-50 p-3 rounded-lg border space-y-2">
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1 font-medium text-slate-700">
                                        <User className="h-3 w-3" />
                                        {comment.user}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(comment.date).toLocaleString('pt-BR')}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-800 whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Comment Form */}
                <div className="space-y-3 pt-4 border-t">
                    <h4 className="text-sm font-medium">Adicionar Comentário</h4>
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Digite seu comentário ou observação..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="text-sm"
                        />
                        <div className="flex justify-end">
                            <Button size="sm" onClick={handleSubmit} disabled={!newComment.trim()}>
                                <Send className="mr-2 h-4 w-4" />
                                Enviar Comentário
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
