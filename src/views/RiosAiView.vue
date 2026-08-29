<script setup>
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useBotStore } from "@/stores/botStore";
import { storeToRefs } from "pinia";

const route = useRoute();
const botStore = useBotStore();
const { botData } = storeToRefs(botStore);

const input = ref("");
const sending = ref(false);
const messages = computed(() => botData.value || []);
const hasChat = computed(() => messages.value.length > 0 || sending.value);

const PROMPT_CARDS = [
  {
    icon: "pi-building",
    title: "Explore projects",
    prompt: "Show me 2 BHK projects in Mumbai under ₹1 Cr",
  },
  {
    icon: "pi-users",
    title: "Group buying",
    prompt: "What is group buying and how much can I save with it?",
  },
  {
    icon: "pi-map-marker",
    title: "Locality insights",
    prompt: "Which areas in Thane are best for investment right now?",
  },
  {
    icon: "pi-indian-rupee",
    title: "Price check",
    prompt: "Is ₹1.5 Cr a fair price for a 3 BHK in Mulund?",
  },
];

const messagesContainer = ref(null);
const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};
watch(messages, scrollToBottom, { deep: true });

const send = async (text) => {
  const msg = (text ?? input.value).trim();
  if (!msg || sending.value) return;
  input.value = "";
  sending.value = true;
  await scrollToBottom();
  try {
    await botStore.sendMessage(msg);
  } finally {
    sending.value = false;
  }
};

const handleKeydown = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
};

const newChat = () => {
  botData.value = [];
  input.value = "";
};

onMounted(() => {
  const q = String(route.query.q || "").trim();
  if (q) send(q);
});
</script>

<template>
  <main class="rios-page relative min-h-screen overflow-hidden pt-28 md:pt-24 pb-8">

    <!-- Aurora backdrop is painted by .rios-page's background gradients -->
    <div class="rios-grid absolute inset-0 pointer-events-none"></div>

    <div class="relative max-w-4xl w-full mx-auto px-4 flex flex-col min-h-[calc(100vh-140px)]">

      <!-- ══════════ HERO MODE ══════════ -->
      <div v-if="!hasChat" class="flex-1 flex flex-col items-center justify-center text-center py-6">

        <!-- Orb -->
        <div class="rios-orb-wrap mb-7">
          <div class="rios-orb-ring"></div>
          <div class="rios-orb">
            <svg class="w-9 h-9 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 0 1.5 5.5 4 7.5S23 12 23 12s-4.5 1.5-7 3.5S12 22 12 22s-1.5-5.5-4-7.5S1 12 1 12s4.5-1.5 7-3.5S12 2 12 2z"/></svg>
          </div>
        </div>

        <p class="rios-fade text-[11px] font-bold tracking-[0.3em] uppercase text-purple-300/80 mb-3" style="animation-delay: 0.05s">
          Your AI Real Estate Assistant
        </p>
        <h1 class="rios-fade font-intertight font-bold text-4xl md:text-6xl text-white leading-tight" style="animation-delay: 0.12s">
          Meet
          <span class="rios-gradient-text">RIOS</span>
        </h1>
        <p class="rios-fade text-white/50 text-sm md:text-base mt-4 max-w-md leading-relaxed" style="animation-delay: 0.2s">
          Projects, prices, localities and group buying — ask anything, in plain language.
        </p>

        <!-- Input bar -->
        <div class="rios-fade w-full max-w-xl mt-9" style="animation-delay: 0.28s">
          <div class="rios-input-border rounded-full p-[1.5px]">
            <div class="flex items-center gap-2 rounded-full bg-[#120c1d] px-5 py-1.5">
              <svg class="w-4 h-4 shrink-0 text-purple-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 0 1.5 5.5 4 7.5S23 12 23 12s-4.5 1.5-7 3.5S12 22 12 22s-1.5-5.5-4-7.5S1 12 1 12s4.5-1.5 7-3.5S12 2 12 2z"/></svg>
              <input
                v-model="input"
                type="text"
                placeholder="Ask RIOS anything about real estate…"
                class="flex-1 bg-transparent text-[15px] outline-none py-3 text-white placeholder-white/30"
                @keydown="handleKeydown"
              />
              <button
                @click="send()"
                :disabled="!input.trim()"
                class="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-rose-500 flex items-center justify-center text-white shrink-0 disabled:opacity-30 hover:opacity-90 transition-opacity"
              >
                <i class="pi pi-send text-sm"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Capability cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl mt-9">
          <button
            v-for="(c, i) in PROMPT_CARDS"
            :key="c.title"
            @click="send(c.prompt)"
            class="rios-fade rios-card group text-left rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1"
            :style="{ animationDelay: `${0.36 + i * 0.08}s` }"
          >
            <span class="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center mb-3 group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-rose-500 transition-all duration-300">
              <i :class="`pi ${c.icon}`" class="text-purple-300 text-sm group-hover:text-white transition-colors"></i>
            </span>
            <p class="text-white text-[13px] font-bold">{{ c.title }}</p>
            <p class="text-white/40 text-[11px] mt-1 leading-relaxed line-clamp-2">{{ c.prompt }}</p>
          </button>
        </div>

        <p class="rios-fade text-white/25 text-[11px] mt-8" style="animation-delay: 0.75s">
          RIOS can make mistakes — verify important details with our team.
        </p>
      </div>

      <!-- ══════════ CHAT MODE ══════════ -->
      <div v-else class="flex-1 flex flex-col min-h-0">

        <!-- Chat header -->
        <div class="flex items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-rose-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 0 1.5 5.5 4 7.5S23 12 23 12s-4.5 1.5-7 3.5S12 22 12 22s-1.5-5.5-4-7.5S1 12 1 12s4.5-1.5 7-3.5S12 2 12 2z"/></svg>
            </div>
            <div>
              <p class="text-white font-bold leading-none">RIOS <span class="rios-gradient-text">AI</span></p>
              <p class="text-white/40 text-[11px] mt-1 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>
                Online · real estate assistant
              </p>
            </div>
          </div>
          <button
            @click="newChat"
            class="flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/30 rounded-full px-3.5 py-2 transition-colors"
          >
            <i class="pi pi-plus text-[10px]"></i>
            New chat
          </button>
        </div>

        <!-- Thread -->
        <div class="flex-1 flex flex-col bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden min-h-[420px]">
          <div ref="messagesContainer" class="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5 rios-thread">

            <template v-for="(m, idx) in messages" :key="idx">
              <!-- Bot -->
              <div v-if="m.from === 'bot' || !m.from" class="flex items-start gap-3 rios-msg">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 0 1.5 5.5 4 7.5S23 12 23 12s-4.5 1.5-7 3.5S12 22 12 22s-1.5-5.5-4-7.5S1 12 1 12s4.5-1.5 7-3.5S12 2 12 2z"/></svg>
                </div>
                <div class="min-w-0">
                  <div class="inline-block max-w-full md:max-w-[85%] rounded-2xl rounded-tl-md bg-white/[0.07] border border-white/10 text-white/90 px-4 py-3">
                    <p class="text-sm leading-relaxed whitespace-pre-line break-words">{{ m.text || m.message || m }}</p>
                  </div>
                  <p class="mt-1.5 text-[10px] text-white/25">{{ m.time || "" }}</p>
                </div>
              </div>

              <!-- User -->
              <div v-else class="flex justify-end rios-msg">
                <div class="flex flex-col items-end gap-1 max-w-[85%]">
                  <div class="inline-block rounded-2xl rounded-tr-md bg-gradient-to-br from-purple-500 to-rose-500 px-4 py-3 text-white shadow-lg shadow-purple-500/20">
                    <p class="text-sm leading-relaxed whitespace-pre-line break-words">{{ m.text || m.message }}</p>
                  </div>
                  <p class="text-[10px] text-white/25">{{ m.time || "" }}</p>
                </div>
              </div>
            </template>

            <!-- Typing indicator -->
            <div v-if="sending" class="flex items-start gap-3 rios-msg">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 0 1.5 5.5 4 7.5S23 12 23 12s-4.5 1.5-7 3.5S12 22 12 22s-1.5-5.5-4-7.5S1 12 1 12s4.5-1.5 7-3.5S12 2 12 2z"/></svg>
              </div>
              <div class="rounded-2xl rounded-tl-md bg-white/[0.07] border border-white/10 px-4 py-4 flex items-center gap-1.5">
                <span class="rios-dot"></span>
                <span class="rios-dot" style="animation-delay: 0.15s"></span>
                <span class="rios-dot" style="animation-delay: 0.3s"></span>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="border-t border-white/10 px-4 py-3.5">
            <div class="rios-input-border rounded-full p-[1.5px]">
              <div class="flex items-center gap-2 rounded-full bg-[#120c1d] px-4 py-1">
                <input
                  v-model="input"
                  type="text"
                  placeholder="Ask a follow-up…"
                  class="flex-1 bg-transparent text-sm outline-none py-2.5 text-white placeholder-white/30"
                  @keydown="handleKeydown"
                />
                <button
                  @click="send()"
                  :disabled="!input.trim() || sending"
                  class="h-9 w-9 rounded-full bg-gradient-to-r from-purple-500 to-rose-500 flex items-center justify-center text-white shrink-0 disabled:opacity-30 hover:opacity-90 transition-opacity"
                >
                  <i class="pi pi-send text-sm"></i>
                </button>
              </div>
            </div>
            <p class="text-center text-[10px] text-white/20 mt-2">RIOS can make mistakes — verify important details with our team.</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Aurora backdrop.
   Was three 420px divs at filter: blur(90px), each animated with translate +
   scale — scaling a 90px-blurred layer forces a full re-rasterisation every
   frame, three times over, and the 40px drift was imperceptible through that
   much blur. The identical look is now baked into the page background as
   extra radial-gradient stops: zero elements, zero layers, zero frame cost. */
.rios-page {
  background:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124, 58, 237, 0.22), transparent 70%),
    radial-gradient(circle 420px at 8% 2%, rgba(147, 51, 234, 0.20), transparent 70%),
    radial-gradient(circle 380px at 96% 96%, rgba(225, 29, 72, 0.15), transparent 70%),
    radial-gradient(circle 300px at 62% 46%, rgba(79, 70, 229, 0.16), transparent 70%),
    #0a0613;
}

/* Faint grid */
.rios-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent);
}

/* Orb */
.rios-orb-wrap {
  position: relative;
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: rios-float 5s ease-in-out infinite;
}
.rios-orb {
  width: 76px;
  height: 76px;
  border-radius: 26px;
  background: linear-gradient(135deg, #a855f7, #ec4899, #f43f5e);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 40px rgba(168, 85, 247, 0.55), 0 0 90px rgba(236, 72, 153, 0.3);
}
.rios-orb-ring {
  position: absolute;
  inset: 0;
  border-radius: 34px;
  border: 1.5px solid rgba(168, 85, 247, 0.4);
  animation: rios-ring 2.6s ease-out infinite;
}
@keyframes rios-ring {
  0%   { transform: scale(0.85); opacity: 1; }
  100% { transform: scale(1.45); opacity: 0; }
}
@keyframes rios-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
}

/* Gradient text + animated input border */
.rios-gradient-text {
  background: linear-gradient(90deg, #c084fc, #f472b6, #fb7185);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
/* Static gradient; brightens when the input is focused, which is where the
   feedback actually means something. */
.rios-input-border {
  background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #ef4444, #f97316);
  transition: filter var(--dur-2) var(--ease-standard);
}
.rios-input-border:focus-within {
  filter: brightness(1.15) saturate(1.1);
}

/* Capability cards */
.rios-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.rios-card:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(168, 85, 247, 0.45);
  box-shadow: 0 12px 34px rgba(168, 85, 247, 0.18);
}

/* Entrances */
.rios-fade {
  animation: rios-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.rios-msg {
  animation: rios-up 0.35s ease-out both;
}
@keyframes rios-up {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Typing dots */
.rios-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: #c084fc;
  animation: rios-bounce 1s ease-in-out infinite;
}
@keyframes rios-bounce {
  0%, 100% { transform: translateY(0); opacity: 0.4; }
  50%      { transform: translateY(-4px); opacity: 1; }
}

/* Slim dark scrollbar for the thread */
.rios-thread::-webkit-scrollbar { width: 6px; }
.rios-thread::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
}
</style>
