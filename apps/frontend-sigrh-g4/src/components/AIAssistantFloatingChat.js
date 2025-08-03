import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FaWandSparkles } from "react-icons/fa6";
import { MdError } from "react-icons/md";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { toastAlerts } from "@/utils/toastAlerts";
import config from "@/config";

export default function AIAssistantFloatingChat() {
  const [open, setOpen] = useState(false);
  const [pregunta, setPregunta] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleEnviar = async () => {
    const now = new Date();

    // Agregar mensaje del usuario
    const userMessage = { role: "user", content: pregunta, timestamp: now };
    const assistantMessage = {
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setPregunta("");
    setIsLoading(true);

    const response = await fetch(
      `${config.API_URL}/assistant/chat-stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pregunta,
          historial: messages.map(({ role, content }) => ({ role, content })),
        }),
      }
    );

    if (response.status != 200) {
      toastAlerts.showError("Ocurrió un error al conectarse al chat")
      setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              error: true
          }
          return updated
      })
      setIsLoading(false)
      return
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    if (reader) {
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      let currentContent = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        try {
          const parsed = JSON.parse(chunk);
          const content = parsed?.message?.content;
          if (content) {
            for (let i = 0; i < content.length; i++) {
              currentContent += content[i];
              // Actualizar solo el último mensaje (asistente)
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: currentContent,
                };
                return updated;
              });
              await delay(10);
            }
          }
        } catch (err) {
          console.error("Error parsing stream chunk:", chunk, err);
        }
      }

      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-2 border-b border-gray-300">
            <h2 className="px-4 py-1 flex gap-2 items-center text-sm text-gray-500 font-semibold">
              <FaWandSparkles /> Asistente SIGRH+
            </h2>
            <button onClick={() => setOpen(false)} className="cursor-pointer">
              <AiOutlineClose size={16} />
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-gray-500 text-xs mt-1 px-1">
              <AiOutlineInfoCircle size={50} className="mt-0.5" />
              <p>
                Las respuestas son generadas por una inteligencia artificial y
                pueden contener imprecisiones. Verificá siempre la información.
              </p>
            </div>
            <div className="whitespace-pre-wrap text-sm bg-gray-50 border border-gray-200 p-2 rounded h-80 overflow-auto">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${msg.role === "user" ? "text-right" : "text-left"}`}
                >
                  <div
                    className={`inline-block max-w-[80%] mb-2 rounded-md px-2 py-1 text-sm ${
                      msg.role === "user"
                        ? "bg-gray-200 border border-gray-300"
                        : "bg-emerald-100 border border-emerald-300"
                    }`}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {msg.role === "user" ? "Tú" : "Asistente"} —{" "}
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                          {msg.error ? (
                            <div className="flex flex-col w-full gap-4 text-red-600 font-bold">
                              <h1 className="text-xl">
                                <MdError />
                              </h1>
                              Ocurrió un error al conectarse al chat, por favor intenta nuevamente.
                            </div>
                          ) : <div>{msg.content}</div>}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="italic text-gray-400 mt-1">Escribiendo...</div>
              )}
            </div>
            <textarea
              rows={1}
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (!isLoading) {
                      handleEnviar()
                    }
                  }
                }
              }
              className="w-full p-2 border border-gray-200 rounded text-sm"
              placeholder="¿Cómo te puedo ayudar?"
            />
            <div className="flex justify-between gap-2">
              <button
                onClick={handleEnviar}
                disabled={isLoading || !pregunta.trim()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-sm rounded cursor-pointer"
              >
                {isLoading ? "Consultando..." : "Enviar"}
              </button>
              <button
                onClick={() => setMessages([])}
                disabled={isLoading}
                className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded text-gray-700"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 cursor-pointer text-white rounded-full bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-500 transition-all"
        >
          Asistente con IA <FaWandSparkles />
        </button>
      )}
    </div>
  );
}
