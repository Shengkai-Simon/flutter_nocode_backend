import React, { useState } from 'react';
import { Sparkles, X, Send, FilePlus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAiAssistantStore } from '@/stores/useAiAssistantStore';
import { cn } from '@/lib/utils';
import {Textarea} from "@/components/ui/textarea.tsx";

interface AiAssistantProps {
    iframeRef: React.RefObject<HTMLIFrameElement>;
}

export function AiAssistant({ iframeRef }: AiAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const { selectedComponent } = useAiAssistantStore();

    const hasSelection = selectedComponent !== null;

    const postMessageToFlutter = (message: object) => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage(message, '*');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        console.log(`Sending AI command: "${inputValue}" for component:`, selectedComponent);

        // --- Simulate interactions with the backend and Flutter ---
        // In a real-world scenario, the backend AI API is called here
        // Then call postMessageToFlutter based on the returned result
        postMessageToFlutter({ type: 'applyJsonPatch', payload: { } });

        setInputValue(''); // Clear the input box
    };

    const handleQuickAction = (actionType: string) => {
        console.log(`Quick action: ${actionType}`, `Selected: ${selectedComponent?.id}`);
        // 预填充输入框或直接触发特定指令
        switch(actionType) {
            case 'generate':
                setInputValue('创建一个包含标题和图片的卡片');
                break;
            case 'modify':
                setInputValue('把背景色改成深蓝色');
                break;
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* AI 指令面板 */}
            {isOpen && (
                <Card className="w-80 shadow-2xl mb-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
                    <CardHeader className="flex flex-row items-center justify-between p-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-500" />
                            <CardTitle className="text-base">AI 助手</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                {hasSelection && (
                                    <CardDescription className="text-xs px-1 pb-2">
                                        已选中: <span className="font-bold text-foreground">{selectedComponent.componentType} ({selectedComponent.id})</span>
                                    </CardDescription>
                                )}
                                <Textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={hasSelection ? '例如: "把边框加粗"' : '例如: "创建一个登录表单"'}
                                    className="h-24 resize-none"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            handleSubmit(e);
                                        }
                                    }}
                                />
                                <div className="flex justify-between items-center pt-2">
                                    <div className="flex gap-2">
                                        {!hasSelection && <Button size="sm" variant="outline" onClick={() => handleQuickAction('generate')}><FilePlus className="h-4 w-4 mr-1"/>生成</Button>}
                                        {hasSelection && <Button size="sm" variant="outline" onClick={() => handleQuickAction('modify')}><Pencil className="h-4 w-4 mr-1"/>修改</Button>}
                                    </div>
                                    <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Hover button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "rounded-full w-14 h-14 shadow-lg transition-transform hover:scale-110",
                    hasSelection && "animate-pulse bg-gradient-to-r from-purple-500 to-indigo-600"
                )}
            >
                <Sparkles className="h-6 w-6" />
            </Button>
        </div>
    );
}
