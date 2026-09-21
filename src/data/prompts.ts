import { QuickPrompt } from '../types';

export const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: 'p1',
    category: 'coding',
    titleBn: 'কোডিং ও সফটওয়্যার ডেভেলপমেন্ট',
    titleEn: 'React Custom Hook Architecture',
    prompt: 'React এ API কল, ক্যাশিং ও রিট্রাই মেকানিজম সহ একটি প্রোডাকশন-রেডি Custom Hook (useFetchData) লিখে দাও। সাথে TypeScript টাইপিং এবং এক্সপ্লেনেশন যুক্ত করো।',
    descriptionBn: 'কোড লেখা, ডিবাগ ও বেস্ট প্র্যাকটিস শেখা',
    icon: 'Code2',
  },
  {
    id: 'p2',
    category: 'writing',
    titleBn: 'লেখালেখি ও যোগাযোগ',
    titleEn: 'Professional Bengali to English Email',
    prompt: 'একটি প্রফেশনাল ইমেইল ড্রাফট করে দাও: একজন ক্লায়েন্টকে সফটওয়্যার প্রজেক্টের ডেলিভারি ডেট, নতুন ফিচার এবং ইনভয়েসের আপডেট জানানো। বাংলা এবং ইংরেজি দুই সংস্করণই দাও।',
    descriptionBn: 'ইমেইল, রিপোর্ট ও অনুবাদ সহায়তা',
    icon: 'PenTool',
  },
  {
    id: 'p3',
    category: 'learning',
    titleBn: 'পড়াশোনা ও শেখা',
    titleEn: 'LLM & Vector DB Deep Dive',
    prompt: 'একটি LLM কীভাবে কাজ করে এবং RAG (Retrieval-Augmented Generation) আর্কিটেকচারে Vector Database (যেমন Pinecone, Chroma) এর ভূমিকা কী—সহজ বাংলায় বাস্তব উদাহরণ দিয়ে বুঝিয়ে দাও।',
    descriptionBn: 'কম্পিউটার সায়েন্স ও জটিল টপিক সহজভাবে',
    icon: 'GraduationCap',
  },
  {
    id: 'p4',
    category: 'research',
    titleBn: 'বিশ্লেষণ ও গবেষণা',
    titleEn: 'Live Google Search & Fact Check',
    prompt: 'বর্তমান সময়ে (২০২৬) জনপ্রিয় AI মডেল ও ফ্রেমওয়ার্কগুলোর সর্বশেষ আপডেট কী? Google Search দিয়ে যাচাই করে তথ্যসূত্রসহ বুলেট পয়েন্টে বিশ্লেষণ দাও।',
    descriptionBn: 'Google Search গ্রাউন্ডিং সহ সাম্প্রতিক তথ্য',
    icon: 'Search',
  },
  {
    id: 'p5',
    category: 'daily',
    titleBn: 'দৈনন্দিন সাহায্য ও প্ল্যানিং',
    titleEn: 'Software Engineering Career Roadmap',
    prompt: 'আমি একজন জুনিয়র সফটওয়্যার ইঞ্জিনিয়ার। আগামী ৬ মাসে AI-Assisted Full-Stack Developer হওয়ার জন্য একটি ধাপে ধাপে স্টাডি প্ল্যান ও রোডম্যাপ তৈরি করে দাও।',
    descriptionBn: 'ক্যারিয়ার পরামর্শ ও রোডম্যাপ',
    icon: 'Compass',
  },
  {
    id: 'p6',
    category: 'research',
    titleBn: 'গান ও লিঙ্ক অনুসন্ধান',
    titleEn: 'YouTube Music & Web Links Finder',
    prompt: 'বাংলা ক্লাসিক ও আধুনিক ৫টি জনপ্রিয় গান (যেমন: নগর বাউল জেমস, অর্ণব, তাহসান) এর নাম, লিরিক্সের মূল ভাব এবং সরাসরি ইউটিউব ও স্পটিফাই লিঙ্ক খুঁজে দাও।',
    descriptionBn: 'ইউটিউব ভিডিও প্লেয়ার ও ওয়েব লিঙ্ক ব্রাউজিং',
    icon: 'Search',
  },
];

export const ARCHITECTURE_GUIDE = {
  titleBn: 'Claude/ChatGPT এর মতো নিজস্ব AI বানানোর গাইড',
  subtitleBn: 'শূন্য থেকে শুরু বনাম বিদ্যমান LLM এর উপর অ্যাপ নির্মাণ',
  path1: {
    title: 'পথ ১: বিদ্যমান LLM এর উপর অ্যাপ বানানো (বাস্তবসম্মত ও সবচেয়ে দ্রুত)',
    duration: 'কয়েক সপ্তাহেই প্রোডাকশন-রেডি',
    steps: [
      {
        title: 'LLM API (The Brain)',
        desc: 'Anthropic Claude API, Google Gemini API, OpenAI API বা ওপেন-সোর্স (DeepSeek, Llama 3)। এটি সব লজিক ও উত্তর জেনারেট করবে।',
        tech: 'Google GenAI SDK, Anthropic SDK, OpenAI',
      },
      {
        title: 'Backend (API & Logic)',
        desc: 'API রিকোয়েস্ট সিকিউর করা, স্ট্রিমিং হ্যান্ডল করা এবং রেট লিমিট নিয়ন্ত্রণ করা।',
        tech: 'Node.js (Express/Fastify) অথবা Python (FastAPI)',
      },
      {
        title: 'Frontend (User Experience)',
        desc: 'চ্যাট ইন্টারফেস, কোড প্রিভিউ, রেসপনসিভ ডিজাইন ও স্ট্রিমিং টাইপরাইটার এফেক্ট।',
        tech: 'React / Next.js, Tailwind CSS, Lucide Icons',
      },
      {
        title: 'Vector Database & RAG',
        desc: 'নিজের প্রাইভেট ডকুমেন্ট, পিডিএফ বা নলেজ বেস থেকে সার্চ করে নির্ভুল উত্তর দেওয়া।',
        tech: 'Pinecone, ChromaDB, PGVector, Weaviate',
      },
      {
        title: 'Agent Frameworks',
        desc: 'টুল কলিং (যেমন গুগল সার্চ, কোড এক্সিকিউশন, ক্যালকুলেটর) এবং মেমোরি ম্যানেজমেন্ট।',
        tech: 'LangChain, LlamaIndex, Google Gemini Tools',
      },
    ],
  },
  path2: {
    title: 'পথ ২: নিজের LLM মডেল ট্রেইন বা ফাইন-টিউন করা (রিসার্চ ও লার্নিং)',
    duration: 'উচ্চ কম্পিউট ও সময়সাপেক্ষ',
    steps: [
      {
        title: 'Deep Learning Frameworks',
        desc: 'ইন্ডাস্ট্রি স্ট্যান্ডার্ড টেনসর ক্যালকুলেশন ও নিউরাল নেটওয়ার্ক ডিজাইন।',
        tech: 'PyTorch, JAX, TensorFlow',
      },
      {
        title: 'Transformer Architecture',
        desc: 'Attention Is All You Need আর্কিটেকচার বোঝা এবং মডেল হেড ইমপ্লিমেন্ট করা।',
        tech: 'Hugging Face Transformers, PyTorch Module',
      },
      {
        title: 'Fine-Tuning (LoRA / QLoRA)',
        desc: 'পুরো মডেল নতুন করে ট্রেইন না করে কম রিসোর্সে নির্দিষ্ট ডোমেইনে স্পেশালাইজ করা।',
        tech: 'PEFT, LoRA, QLoRA, Unsloth',
      },
      {
        title: 'Hardware & Compute',
        desc: 'GPU রিসোর্স ম্যানেজমেন্ট ও মডেল কোয়ান্টাইজেশন (4-bit/8-bit)।',
        tech: 'RunPod, Lambda Labs, Google Cloud Vertex, Colab Pro',
      },
    ],
  },
};
