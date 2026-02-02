import { FiMessageSquare } from 'react-icons/fi'
import { Button } from '../ui/button'
import DialogWrapper from './DialogWrapper'
import { RiChatAiFill } from 'react-icons/ri'
import { FiUser } from 'react-icons/fi'

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useVRStore from '../../store/vr.store';
import { CURRENT_AREA_ID } from '../../constants/env.constants';

import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from '../ui/shadcn-io/ai/conversation';

import { Message, MessageContent } from '../ui/shadcn-io/ai/message';
import {
    PromptInput,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputToolbar,
    PromptInputTools,
} from '@/components/ui/shadcn-io/ai/prompt-input';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Spinner } from '../ui/shadcn-io/spinner'

const ChatbotDialogBlock = () => {
    const { currentArea, currentHotspot, currentPanorama } = useVRStore();
    const [threadId] = useState(() => uuidv4());

    const [messages, setMessages] = useState<Array<{
        id: string,
        role: 'user' | 'assistant',
        content: string,
        timestamp: Date
    }>>([
        {
            id: uuidv4(),
            content: "Chào bạn, mình là trợ lý ảo của hệ thống bản đồ số. Bạn cần mình trợ giúp gì nè?",
            role: 'assistant',
            timestamp: new Date(),
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');



    const handleSubmit = async (question: string) => {
        setIsLoading(true);

        // Add user message immediately
        const userMessage = {
            id: `user-${Date.now()}`,
            role: 'user' as const,
            content: question,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        const askRequest = {
            question: question,
            context: currentPanorama && `Vị trí hiện tại của người dùng: ${currentHotspot?.title || ''}`,
            metadata: {
                area_name: currentArea?.area_name,
                hotspot_id: currentHotspot?.hotspot_id,
                panorama_id: currentPanorama?.panorama_id,
                panorama_title: currentPanorama?.title
            },
            thread_id: threadId,
            area_id: CURRENT_AREA_ID || ''
        };

        try {
            const response = await fetch('http://localhost:8000/chats/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(askRequest),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.text();

            // Add AI response immediately
            const aiMessage = {
                id: `ai-${Date.now()}`,
                role: 'assistant' as const,
                content: data,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsLoading(false);

        } catch (error) {
            console.error('Error sending message:', error);
            // Add error message
            const errorMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant' as const,
                content: 'Sorry, there was an error processing your request.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
        }
    };

    const handleFormSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!inputValue.trim() || isLoading) return;

        handleSubmit(inputValue);
        setInputValue('');
    }, [inputValue, isLoading]);

    const handleSuggestionClick = useCallback((suggestion: string) => {
        if (isLoading) return;

        // Replace both "đây" and "Đây" with the current hotspot title
        const hotspotTitle = currentHotspot?.title || 'địa điểm này';
        const questionWithLocation = suggestion
            .replace(/Đây/g, hotspotTitle)
            .replace(/đây/g, hotspotTitle);

        handleSubmit(questionWithLocation);
    }, [isLoading, currentHotspot?.title, handleSubmit]);

    return (
        <DialogWrapper

            trigger={
                <Button className="w-12 h-12 xl:w-16 xl:h-16 shadow-lg rounded-full glass glass-hover ring-1 ring-black/10 flex items-center justify-center">
                    <RiChatAiFill className="!size-6 sm:!size-7 xl:!size-9" />
                </Button>

            }
            showHeader={true}
            headerIcon={<FiMessageSquare className='text-primary' />}
            title="Chatbot"
            description=""
            showCloseButton={true}
            showFooter={false}
            size="xl"
            mobileSize="lg"
            useCustomScrollbar={true}
        >
            <div className="flex  h-full w-full flex-col overflow-hidden">
                <Conversation className="flex-1">
                    <ConversationContent className="space-y-4">
                        {messages.map((message) => (
                            <div key={message.id} className="space-y-3">
                                <Message from={message.role}>
                                    <MessageContent
                                        className={cn(
                                            message.role !== 'user'
                                                ? 'glass-light !text-white  border border-border'
                                                : '!bg-blue-500/30 shadow-inner  !text-white  border border-blue-600/30 hover:bg-blue-600/30 hover:border-blue-600/40 transition-all ease-in-out duration-150'
                                        )}
                                    >
                                        {message.content}
                                    </MessageContent>
                                    <Avatar className="size-8">
                                        {message.role === 'user' ? (

                                            <AvatarFallback className='bg-primary flex items-center justify-center'>
                                                <FiUser className="w-4 h-4 text-primary-foreground" />
                                            </AvatarFallback>
                                        ) : (
                                            <AvatarFallback className='glass flex items-center justify-center'>
                                                <RiChatAiFill className="w-4 h-4 text-primary-foreground" />
                                            </AvatarFallback>

                                        )}
                                    </Avatar>
                                </Message>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="space-y-3">
                                <Message from="assistant">
                                    <MessageContent
                                        className='glass-light !text-white  border border-border'
                                    >
                                        <div className="flex items-center gap-2">
                                            <Spinner className='text-white' size={20} />
                                            <span className="text-white text-sm">Đang suy nghĩ...</span>
                                        </div>
                                    </MessageContent>
                                    <Avatar className="size-8">
                                        <AvatarFallback className='glass flex items-center justify-center'>
                                            <RiChatAiFill className="w-4 h-4 text-primary-foreground" />
                                        </AvatarFallback>
                                    </Avatar>
                                </Message>
                            </div>
                        )}


                    </ConversationContent>
                    <ConversationScrollButton />
                </Conversation>

                {/* Input Area */}
                <div className="p-4">
                    {/* Suggestion Pills */}
                    {!isLoading && (
                        <div className="mb-3">
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                                {[
                                    "Đây là ở đâu?",
                                    "Giới thiệu về lịch sử nơi đây",
                                    "Có gì đặc biệt ở đây?",
                                    "Kể thêm về đây"
                                ].map((suggestion, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        className="glass glass-hover hover:text-white text-white border-white/20 hover:border-white/40 rounded-full text-xs whitespace-nowrap flex-shrink-0"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    <PromptInput className='glass text-white' onSubmit={handleFormSubmit}>
                        <PromptInputTextarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Hỏi tôi bất cứ điều gì về các địa chỉ đỏ..."
                            disabled={isLoading}
                        />
                        <PromptInputToolbar>
                            <PromptInputTools>
                                {/* <PromptInputButton disabled={isLoading}>
                                    <PaperclipIcon size={16} />
                                </PromptInputButton> */}
                                {/* <PromptInputButton disabled={isLoading}>
                                    <MicIcon size={16} />
                                    <span>Voice</span>
                                </PromptInputButton> */}
                            </PromptInputTools>
                            <PromptInputSubmit
                                disabled={!inputValue.trim() || isLoading}
                            />
                        </PromptInputToolbar>
                    </PromptInput>
                </div>
            </div>

        </DialogWrapper>
    )
}

export default ChatbotDialogBlock
