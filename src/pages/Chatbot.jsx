import React, { useState, useEffect, useRef } from 'react'
import Loadingpage from './Loadingpage'

const Chatbot = () => {

    const [input, setinput] = useState("")
    const [messages, setMessages] = useState([])
    const [loadingP, setLoadingP] = useState(true)
    const [loading, setLoading] = useState(false)
    const [sources, setSources] = useState([])
    const [selectedSource, setSelectedSource] = useState(null)

    // Scroll ref
    const messagesEndRef = useRef(null)
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, loading])

    setTimeout(() => {
        loadingP && setLoadingP(false)
    }, 2000);

    useEffect(() => {
        const fetchSources = async () => {
            try {
                const res = await fetch("https://hema01-chatbot-simulation-interview.hf.space/api/sources")
                if (!res.ok) throw new Error("Failed to fetch sources")
                const data = await res.json()
                setSources(data)
                setMessages((prev) => [...prev, { sender: "bot", text: "Now choose a major" }])
            } catch (err) {
                console.log(err)
                setMessages((prev) => [...prev, { sender: "bot", text: "Error fetching sources. Please try again later." }])
            }
        }
        fetchSources()
    }, [])

    const clearChat = () => {
        setMessages([]);
        setMessages((prev) => [...prev, { sender: "bot", text: `Now choose a major.` }]);
    }

    const selectSource = async (sourceName) => {
        setLoading(true)
        try {
            console.log(`Attempting to select source: ${sourceName}`);
            const res = await fetch("https://hema01-chatbot-simulation-interview.hf.space/api/select_source", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ source_name: sourceName })
            });
            console.log(`Response status: ${res.status}`);
            if (res.ok) {
                setSelectedSource(sourceName);
                setMessages((prev) => [...prev, { sender: "bot", text: `Selected source: ${sourceName}, You can now generate a question.` }]);
            } else {
                const errorData = await res.json();
                console.error("Error selecting source:", errorData);
                throw new Error(errorData.message || "Failed to select source");
            }
            setLoading(false)
        } catch (err) {
            console.error("Error in selectSource function:", err);
            setMessages((prev) => [...prev, { sender: "bot", text: "Error selecting source. Please try again." }]);
            setLoading(false)
        }
    }

    const generateQuestion = async () => {
        if (!selectedSource) {
            setMessages((prev) => [...prev, { sender: "bot", text: "Please select a source first." }])
            return
        }
        setLoading(true)
        try {
            const res = await fetch("https://hema01-chatbot-simulation-interview.hf.space/api/generate_question")
            const data = await res.json()
            setMessages((prev) => [...prev, { sender: "bot", text: data.question || "No question generated." }])
            setLoading(false)
        } catch (err) {
            console.log(err)
            setLoading(false)
        }
    }

    const submitAnswer = async () => {
        if (!input.trim()) return
        const userMsg = { sender: 'user', text: input }
        setMessages((prev) => [...prev, userMsg])
        setinput("")
        setLoading(true)
        try {
            const res = await fetch("https://hema01-chatbot-simulation-interview.hf.space/api/submit_answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answer: input })
            })
            const data = await res.json()
            const botMsg = {
                sender: "bot",
                text: data.feedback ? `${data.feedback}\nScore: ${data.score}, Please clear the chat and start over.` : "No evaluation received."
            }
            setLoading(false)
            setMessages((prev) => [...prev, botMsg])
        } catch (err) {
            console.log(err)
            setMessages((prev) => [...prev, { sender: "bot", text: "Error getting response. Try again." }])
            setLoading(false)
        }
    }


    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault()
            submitAnswer()
        }
    }

    return (
        <section className='relative min-h-screen bg-gradient-to-br from-[#091818] to-[#092929] text-white flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden'>

            <div className='w-full max-w-5xl h-[85vh] md:h-[700px] bg-white/5 backdrop-blur-xl border mt-12 border-white/10 rounded-3xl shadow-2xl flex flex-col relative z-10 overflow-hidden'>

                {/* --- Header Section --- */}
                <div className='p-4 md:p-6 bg-white/5 border-b border-white/10 flex flex-col gap-4'>
                    
                    {/* Source Chips */}
                    <div className='flex flex-wrap gap-2 items-center'>
                        <span className="text-xs text-white/70 font-bold uppercase tracking-wider mr-2">Select Major:</span>
                        {sources.map((src, i) => (
                            <button
                                key={i}
                                onClick={() => { selectSource(src) }}
                                disabled={loading}
                                className={`px-4 py-1.5 text-sm rounded-xl transition-all duration-300 border font-medium ${
                                    selectedSource === src
                                        // Active State: واخد لون السيان المميز
                                        ? "bg-[#20bec4]/20 border-[#20bec4] text-[#20bec4] shadow-[0_0_10px_rgba(32,190,196,0.2)]"
                                        // Inactive State: واخد ستايل شفاف
                                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                {src}
                            </button>
                        ))}
                    </div>

                    {/* Generate Button: نفس ستايل زرار Start Exploring */}
                    <button
                        onClick={generateQuestion}
                        disabled={loading || !selectedSource}
                        className={`w-full md:w-auto self-start px-6 py-2.5 bg-[#20bec4] hover:bg-[#169ba0] text-black font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                        <span>Generate Question</span>
                    </button>
                </div>

                {/* --- Chat Area --- */}
                <div className='flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-black/10'>
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm
                                ${msg.sender === 'user'
                                    // User Message: واخد لون السيان مع نص أسود لتباين عالي زي زرار الموقع
                                    ? 'bg-[#20bec4] text-black font-medium rounded-tr-sm' 
                                    // Bot Message: واخد ستايل شفاف غامق
                                    : 'bg-white/10 text-white/90 border border-white/10 rounded-tl-sm'} 
                            `}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}

                    {/* Loading Animation */}
                    {loading &&
                        <div className="flex justify-start w-full animate-pulse">
                            <div className="bg-white/10 p-4 rounded-2xl rounded-tl-sm border border-white/10 flex gap-2 items-center">
                                <div className="w-2 h-2 bg-[#20bec4] rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-[#20bec4] rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-[#20bec4] rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    }
                    <div ref={messagesEndRef} />
                </div>

                {/* --- Footer / Input Section --- */}
                <div className='p-4 md:p-6 bg-white/5 border-t border-white/10 flex flex-col gap-3'>
                    <div className='relative flex items-center gap-3'>
                        <input
                            className='w-full h-[50px] pl-5 pr-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#20bec4] focus:ring-1 focus:ring-[#20bec4] transition-all'
                            type="text"
                            name='massage'
                            placeholder="Type your answer..."
                            value={input}
                            onChange={(e) => setinput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    
                    <div className='flex gap-3 justify-end'>
                         <button
                            onClick={clearChat}
                            className='px-6 py-2 h-[45px] text-sm font-medium text-white/60 hover:text-red-400 transition-colors rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10'
                        >
                            Clear Chat
                        </button>

                        <button
                            onClick={submitAnswer}
                            disabled={!input.trim()}
                            // Send Button: نفس ستايل زرار Start Exploring
                            className={`px-8 py-2 h-[45px] text-black font-bold bg-[#20bec4] hover:bg-[#169ba0] rounded-xl shadow-lg transition-all ease-in duration-200 ${!input.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Send Answer
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Chatbot