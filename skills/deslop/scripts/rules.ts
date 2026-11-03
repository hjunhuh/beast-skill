/**
 * Pattern rules for text that reads as chatbot-written.
 *
 * Built from the categories in Wikipedia's "Signs of AI writing" guide
 * (WikiProject AI Cleanup) and the ideas in blader/humanizer and
 * hardikpandya/stop-slop, rewritten and extended with Korean patterns.
 * No single hit proves anything; the score is about clusters.
 */

export type Severity = "high" | "medium" | "low";
export type Lang = "en" | "ko" | "any";
export type Category = "punctuation" | "structure" | "vocabulary" | "chatbot" | "content" | "translationese";

export type Rule = {
  id: string;
  lang: Lang;
  category: Category;
  severity: Severity;
  pattern: RegExp;
  message: string;
  fix: string;
};

const r = (
  id: string,
  lang: Lang,
  category: Category,
  severity: Severity,
  pattern: RegExp,
  message: string,
  fix: string,
): Rule => ({ id, lang, category, severity, pattern, message, fix });

const words = (list: string[]) => new RegExp(`\\b(?:${list.join("|")})\\b`, "gi");

export const RULES: Rule[] = [
  // Punctuation and typography
  r("em-dash", "any", "punctuation", "high", /—|\s–\s/g, "Em dash (or spaced en dash)", "Use a comma, period, colon or parentheses, whichever matches the job the dash was doing."),
  r("middle-dot", "ko", "punctuation", "low", /\S·\S/g, "가운뎃점 나열", "쉼표나 '와/과'로 풀어 쓰세요. 고유명사(3·1운동 등)는 그대로 둡니다."),
  r("curly-quotes", "en", "punctuation", "low", /[“”‘’]/g, "Curly quotes in plain text", "Use straight quotes unless the publication style uses curly ones."),
  r("ellipsis-char", "any", "punctuation", "low", /…/g, "Ellipsis character", "Use three periods or end the sentence."),
  r("emoji-bullet", "any", "punctuation", "medium", /^\s*(?:[-*+]\s*)?\p{Extended_Pictographic}/gmu, "Emoji used as a bullet or heading marker", "Drop the emoji; let the words carry the point."),
  r("inline-header-bullet", "any", "structure", "medium", /^\s*(?:[-*+]|\d+\.)\s+\*\*[^*\n]{1,48}(?::\*\*|\*\*\s*:)/gm, "Bullet that starts with a bold label and a colon", "Write the point as a sentence, or make it a real table if it is reference data."),

  // Structures
  r("not-x-but-y", "en", "structure", "high", /\bnot (?:just|only|merely|simply)\b[^.!?\n]{1,90}?\b(?:but|it'?s|it is)\b/gi, "\"Not just X, but Y\" contrast", "State Y directly. Keep X only if someone actually believed it."),
  r("its-not-its", "en", "structure", "high", /\b(?:it|this|that)(?:'s| is| was)(?: not|n'?t)\b[^.!?\n]{1,90}?[.;,:—–-]\s*(?:it|this|that)(?:'s| is| was)\b/gi, "\"It's not X. It's Y.\" reveal", "Say what it is. Drop the strawman."),
  r("isnt-about", "en", "structure", "high", /\bisn'?t (?:really )?about\b[^.!?\n]{1,90}?[.;,—–-]\s*(?:it'?s|it is) about\b/gi, "\"This isn't about X. It's about Y.\"", "Say what it is about."),
  r("colon-reveal", "en", "structure", "medium", /\b(?:the|and the) (?:result|answer|kicker|catch|truth|best part|twist|secret)\?\s/gi, "Question-and-reveal setup (\"The result? ...\")", "Just state the result."),
  r("heres-setup", "en", "structure", "medium", /\bhere'?s (?:the thing|why|what|how|the kicker|the catch|the deal)\b\s*[:.—-]/gi, "\"Here's the thing:\" setup", "Delete the setup and start with the point."),
  r("lets-dive", "en", "chatbot", "high", /\blet'?s (?:dive|delve|jump|unpack|break (?:it|this) down|explore|take a (?:closer )?look)\b/gi, "\"Let's dive in\" opener", "Start with the content."),
  r("ing-tail", "en", "structure", "medium", /,\s(?:highlighting|underscoring|emphasizing|showcasing|reflecting|demonstrating|cementing|solidifying|marking|signaling|illustrating)\b/gi, "Trailing \"-ing\" clause that editorializes", "End the sentence at the fact, or make the claim its own sentence with evidence."),
  r("from-x-to-y", "en", "structure", "low", /\bfrom [a-z]+(?: [a-z]+){0,2} to [a-z]+(?: [a-z]+){0,2}(?:,| and)\b/gi, "\"From X to Y\" false range", "Name the actual things, or cut the range."),
  r("serves-as", "en", "structure", "medium", /\b(?:serves|stands|acts|functions) as\b|\bboasts\b/gi, "\"Serves as / stands as / boasts\" instead of is/has", "Use \"is\" or \"has\"."),
  r("transition-opener", "en", "structure", "low", /(?:^|[.!?]\s+)(?:Moreover|Furthermore|Additionally|In addition|Notably|Importantly|Crucially|Ultimately|Overall|Indeed)\b/gm, "Stock transition at the start of a sentence", "Delete it; the order of sentences already shows the link."),
  r("summary-closer", "en", "structure", "medium", /(?:^|[.!?]\s+)(?:In conclusion|In summary|To summarize|To sum up|All in all|At the end of the day)\b/gim, "Essay-style summary closer", "End on the last real point."),
  r("hedge-stack", "en", "structure", "medium", /\b(?:may|might|could) (?:potentially|possibly|perhaps)\b|\bit could be argued\b|\bto some extent\b/gi, "Stacked hedge", "Hedge once, where the uncertainty is real."),
  r("intensifier", "en", "vocabulary", "low", words(["truly", "genuinely", "incredibly", "deeply", "profoundly", "remarkably", "undeniably"]), "Intensifier", "Cut it, or replace with the specific detail that makes it true."),

  // Vocabulary
  r("ai-words-high", "en", "vocabulary", "high", words(["delve[sd]?", "delving", "tapestry", "testament", "ever-evolving", "game-?changer", "paradigm shift"]), "Stock chatbot word", "Use the plain word for what you mean."),
  r("ai-words", "en", "vocabulary", "medium", words(["pivotal", "seamless(?:ly)?", "intricate", "multifaceted", "holistic", "foster(?:s|ing)?", "underscore[sd]?", "showcas(?:e|es|ed|ing)", "elevat(?:e|es|ed|ing)", "empower(?:s|ed|ing)?", "embark(?:s|ed|ing)?", "vibrant", "bustling", "meticulous(?:ly)?", "commendable", "paramount", "realm", "cutting-edge", "unwavering", "invaluable", "nestled", "boundless"]), "Chatbot-flavored word", "Pick the concrete word or describe the thing itself."),
  r("ai-words-low", "en", "vocabulary", "low", words(["crucial", "vital", "robust", "leverag(?:e|es|ed|ing)", "utiliz(?:e|es|ed|ing)", "landscape", "nuanced", "journey", "navigat(?:e|es|ing) the"]), "Overused word (fine in technical senses)", "Keep it only if it is the precise term."),
  r("stock-phrase", "en", "vocabulary", "high", /\b(?:in today'?s (?:fast-paced|digital|modern|ever-changing) world|plays? an? (?:vital|crucial|pivotal|key|significant) role|a rich (?:tapestry|history) of|it'?s important to (?:note|remember)|it'?s worth (?:noting|mentioning)|needless to say|look no further|unlock(?:s|ing)? the (?:power|potential|secrets?) of|whether you'?re a)\b/gi, "Stock phrase", "Delete it or say the specific thing."),

  // Chatbot voice
  r("chatbot-opener", "en", "chatbot", "high", /^(?:great question|good question|certainly|absolutely|of course|sure thing|excellent question)[!,.]/gim, "Chatbot opener", "Start with the answer."),
  r("happy-to-help", "en", "chatbot", "high", /\b(?:I'?d be happy to|I'?m happy to help|happy to help|I hope this helps|hope this helps|let me know if (?:you|there)|feel free to (?:reach out|ask|let me know)|don'?t hesitate to)\b/gi, "Chatbot pleasantry", "Delete it."),
  r("youre-right", "en", "chatbot", "high", /\byou'?re (?:absolutely|completely|totally) right\b|\bthat'?s a (?:great|fantastic|excellent) (?:point|question|idea)\b/gi, "Sycophantic agreement", "Respond to the content instead."),
  r("ai-disclaimer", "en", "chatbot", "high", /\bas an AI(?: language model)?\b|\bmy (?:knowledge|training) cutoff\b|\bas of my (?:last|latest) (?:update|training)\b/gi, "AI self-reference or cutoff disclaimer", "Remove it; if a date matters, state the date."),
  r("structure-announce", "en", "chatbot", "medium", /\b(?:below is|here is|here'?s) an? (?:breakdown|overview|summary|comprehensive|detailed|quick)\b/gi, "Announces the structure instead of delivering it", "Delete the announcement."),

  // Content
  r("vague-attribution", "en", "content", "medium", /\b(?:experts|studies|research|researchers|critics|observers|many people|some say|industry reports)(?: have)? (?:say|says|show|shows|suggest|suggests|note|noted|agree|believe|argue)\b/gi, "Vague attribution", "Name the source or drop the claim."),
  r("bright-future", "en", "content", "medium", /\b(?:the future (?:looks|is) bright|only time will tell|remains to be seen|exciting times ahead|poised to)\b/gi, "Generic upbeat conclusion", "End on a concrete fact or next step."),

  // Korean: translationese
  r("ko-tonghae", "ko", "translationese", "low", /(?:을|를) 통해(?:서)?/g, "'~를 통해' 번역투", "'~로', '~해서'처럼 동사로 풀어 쓰세요."),
  r("ko-eisseo", "ko", "translationese", "medium", /(?:함|하는 데|하는 것|에) 있어(?:서)?/g, "'~에 있어서' 번역투", "'~할 때', '~에서'로 바꾸세요."),
  r("ko-gajigo", "ko", "translationese", "low", /가지고 있(?:다|습니다|는|어요)/g, "'가지고 있다' (have 직역)", "소유가 아니면 '있다', '~하다'로 줄이세요."),
  r("ko-ganeung", "ko", "translationese", "medium", /(?:하는|할) 것이 가능(?:하|합)/g, "'~하는 것이 가능하다'", "'~할 수 있다'로 쓰세요."),
  r("ko-double-passive", "ko", "translationese", "medium", /되어지|되어져|되어진|지어지|불려지/g, "이중 피동", "'되다', '불리다'로 충분합니다."),
  r("ko-roinhae", "ko", "translationese", "low", /로 인해(?:서)?/g, "'~로 인해'", "'~ 때문에', '~해서'가 더 자연스러운지 보세요."),

  // Korean: stock expressions and chatbot voice
  r("ko-alabogetseumnida", "ko", "chatbot", "high", /(?:에 대해|을|를|에 대해서) (?:알아보겠습니다|알아볼까요|살펴볼까요)|떠나볼까요|함께 알아봅시다/g, "'~에 대해 알아보겠습니다' 도입부", "바로 내용으로 시작하세요."),
  r("ko-salpyeo", "ko", "chatbot", "medium", /살펴보겠습니다|정리해 ?보겠습니다|말씀드리겠습니다/g, "진행 예고", "예고 없이 내용을 바로 쓰세요."),
  r("ko-closer", "ko", "chatbot", "high", /도움이 되(?:셨|었)(?:길|으면|기를) (?:바랍니다|좋겠습니다)|궁금한 점이 있으(?:시면|면) 언제든|언제든(?:지)? (?:말씀|문의)해 ?주세요/g, "챗봇식 맺음말", "마지막 실제 내용에서 끝내세요."),
  r("ko-summary", "ko", "structure", "medium", /(?:^|[.!?]\s+)(?:결론적으로|요약하자면|정리하자면|종합하면)/gm, "요약형 맺음 연결어", "결론 표지 없이 결론을 쓰세요."),
  r("ko-transition", "ko", "structure", "low", /(?:^|[.!?]\s+)(?:또한|더불어|나아가|아울러|무엇보다|특히),?\s/gm, "문장 첫머리 기계적 연결어", "빼도 뜻이 통하면 빼세요."),
  r("ko-role", "ko", "vocabulary", "medium", /중요한 역할을 (?:합니다|한다|하고)|핵심적인 역할|한 걸음 더 나아가|빼놓을 수 없는|라고 할 수 있(?:습니다|다)/g, "상투 표현", "무엇을 어떻게 하는지 구체적으로 쓰세요."),
  r("ko-vague-words", "ko", "vocabulary", "low", /다양한|효과적(?:으로|인)|체계적(?:으로|인)|시너지|인사이트|혁신적(?:인|으로)/g, "모호한 수식어", "무엇이 다양한지, 어떻게 효과적인지 구체적으로 쓰세요."),
  r("ko-not-but", "ko", "structure", "medium", /단순히 [^.!?\n]{1,40}(?:이|가) 아니라|[^.!?\n]{1,30}(?:이|가) 아닙니다\.\s*[^.!?\n]{1,40}입니다/g, "'단순히 X가 아니라 Y' 대조 공식", "Y를 바로 말하세요."),
  r("ko-over-honorific", "ko", "chatbot", "low", /권장드립니다|안내드립니다|부탁드립니다\.?\s*감사합니다/g, "과잉 존대", "'권합니다', '알려 드립니다'처럼 담백하게 쓰세요."),
];

export const SEVERITY_POINTS: Record<Severity, number> = { high: 3, medium: 2, low: 1 };
