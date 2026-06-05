import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { ChefHat, X, Send, Mic, MicOff, Volume2, ImagePlus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const QUICK_QUESTIONS = [
  "Explain this step in detail",
  "What can I substitute?",
  "What if I make a mistake?",
  "Beginner explanation",
  "Professional tips",
];

export default function AskChefAI({ recipe, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  const isPro = user?.account_type === 'professional';

  useEffect(() => {
    if (isOpen && recipe) loadConversation();
  }, [isOpen, recipe?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async () => {
    try {
      const convs = await base44.entities.ChefConversation.filter({
        recipe_id: recipe.id,
        user_email: user?.email
      });
      if (convs.length > 0) {
        setConversationId(convs[0].id);
        setMessages(convs[0].messages || []);
      } else {
        setConversationId(null);
        setMessages([{
          role: 'assistant',
          content: `Hi! I'm your personal **Chef AI** for **${recipe.name}**! 👨‍🍳\n\nI know everything about this recipe — the ingredients, steps, techniques, and more. Ask me anything!\n\n${isPro ? 'I see you\'re a professional — I\'ll give you advanced culinary insights.' : 'I\'ll guide you through every step in simple, clear language.'}`,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveConversation = async (updatedMessages) => {
    try {
      if (conversationId) {
        await base44.entities.ChefConversation.update(conversationId, { messages: updatedMessages });
      } else {
        const conv = await base44.entities.ChefConversation.create({
          recipe_id: recipe.id,
          user_email: user?.email,
          messages: updatedMessages
        });
        setConversationId(conv.id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const buildSystemPrompt = () => {
    const level = isPro ? 'professional chef' : 'beginner home cook';
    return `You are Chef AI, a warm and knowledgeable personal cooking assistant. The user is a ${level}.

RECIPE CONTEXT:
- Name: ${recipe.name}
- Cuisine: ${recipe.cuisine || 'Not specified'}
- Difficulty: ${recipe.difficulty || 'Not specified'}
- Cook Time: ${recipe.cook_time ? `${recipe.cook_time} minutes` : 'Not specified'}
- Ingredients: ${recipe.ingredients?.join(', ') || 'Not specified'}
- Instructions: ${recipe.instructions || 'Not specified'}

YOUR GUIDELINES:
- Only answer cooking-related questions about this recipe and general cooking
- ${isPro
    ? 'Use professional culinary terminology. Discuss technique, texture, flavor science, plating. Suggest professional refinements and alternative methods.'
    : 'Use very simple, friendly language. Always explain cooking terms. Break down every step for beginners. Be encouraging and supportive.'
}
- Help with substitutions, troubleshooting, technique explanations
- Keep responses focused and clear
- Use markdown for structure (bold key terms, numbered lists for steps)
- Be conversational and encouraging`;
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: 'user', content: trimmed, timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const history = updatedMessages
        .map(m => `${m.role === 'user' ? 'User' : 'Chef AI'}: ${m.content}`)
        .join('\n\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${buildSystemPrompt()}\n\nCONVERSATION HISTORY:\n${history}\n\nChef AI:`,
      });

      const aiMsg = { role: 'assistant', content: response, timestamp: new Date().toISOString() };
      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);
      saveConversation(finalMessages);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Voice input not supported in this browser.'); return; }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.onresult = (e) => {
      setInputText(e.results[0][0].transcript);
      setIsListening(false);
    };
    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.start();
    setIsListening(true);
  };

  const speakMessage = (text) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#`_~]/g, ''));
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await sendMessage(`I'm sharing a photo of my cooking progress. Please give me feedback or advice based on what you see. Image: ${file_url}`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }
  };

  if (!recipe) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 bg-gradient-to-r from-emerald-600 to-orange-500 text-white pl-4 sm:pl-5 pr-4 sm:pr-6 py-3 sm:py-4 rounded-2xl shadow-2xl hover:shadow-orange-500/30 hover:scale-105 transition-all flex items-center gap-2 sm:gap-3 font-semibold text-sm group"
      >
        <div className="bg-white/20 rounded-lg p-1 group-hover:rotate-12 transition-transform">
          <ChefHat className="w-4 h-4" />
        </div>
        Ask Chef AI
      </button>

      {/* Backdrop + Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="relative w-full md:w-[430px] h-[90vh] md:h-[78vh] md:mr-6 md:mb-6 bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-orange-500 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">Chef AI</h3>
                  <p className="text-white/75 text-xs truncate max-w-[180px]">{recipe.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/20 text-white border border-white/30 px-2.5 py-1 rounded-full font-medium">
                  {isPro ? '⭐ Pro Mode' : '🌱 Beginner Mode'}
                </span>
                <button
                  onClick={handleClose}
                  className="text-white/70 hover:text-white ml-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Questions */}
            <div className="px-4 pt-3 pb-2 bg-gradient-to-b from-gray-50 to-white border-b flex-shrink-0">
              <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Quick Questions</p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className="flex-shrink-0 text-xs bg-white border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-50 hover:border-emerald-400 transition-all whitespace-nowrap disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-orange-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <ChefHat className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] group`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:my-2 prose-strong:text-gray-900">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => speakMessage(msg.content)}
                        className="mt-1 ml-1 text-gray-300 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading dots */}
              {isLoading && (
                <div className="flex justify-start gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <ChefHat className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-5 py-4">
                    <div className="flex gap-1.5 items-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-4 py-3 border-t bg-white flex-shrink-0">
              <div className="flex items-center gap-2 bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
                  placeholder={isListening ? '🎤 Listening...' : 'Ask about this recipe...'}
                  className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
                  disabled={isLoading}
                />

                {/* Image upload */}
                <label className="cursor-pointer text-gray-400 hover:text-emerald-600 transition-colors flex-shrink-0" title="Share a photo">
                  <ImagePlus className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>

                {/* Voice input */}
                <button
                  onClick={toggleVoiceInput}
                  className={`flex-shrink-0 transition-all ${isListening ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-emerald-600'}`}
                  title="Voice input"
                >
                  {isListening ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Send */}
                <button
                  onClick={() => sendMessage(inputText)}
                  disabled={!inputText.trim() || isLoading}
                  className="bg-gradient-to-r from-emerald-600 to-orange-500 text-white p-2 rounded-xl disabled:opacity-30 hover:scale-105 transition-all flex-shrink-0 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">Chef AI knows your full recipe context</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}