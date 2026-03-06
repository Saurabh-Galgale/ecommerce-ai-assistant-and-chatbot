import { Link } from "react-router-dom";
import { Target, Brain, MessageSquare, Sliders, Laptop } from "lucide-react";

const features = [
  {
    icon: <Target className="w-8 h-8 text-blue-500" />,
    prompt: `"Hey SG-AI, suggest travel accessories I need for my Japan trip in June."`,
    desc: "Traditional sites force you to guess categories and manually filter for umbrellas or adapters. SG-AI knows June is Japan's rainy season and instantly builds a customized, weather-appropriate gear list.",
  },
  {
    icon: <Brain className="w-8 h-8 text-purple-500" />,
    prompt: `"SG-AI, find a tech gift for my dad who isn't great with gadgets."`,
    desc: "Checkboxes can't quantify human subjectivity. Standard filters fail completely here, but SG-AI understands the context of 'easy to use' and suggests products with voice-activation and simple setups.",
  },
  {
    icon: <MessageSquare className="w-8 h-8 text-green-500" />,
    prompt: `"Hey SG-AI, do these shoes run small, and are they good for flat feet?"`,
    desc: "Instead of wasting hours scrolling through 50+ text reviews hoping someone mentions your specific issue, SG-AI instantly synthesizes real customer feedback to give you a definitive yes or no.",
  },
  {
    icon: <Sliders className="w-8 h-8 text-orange-500" />,
    prompt: `"SG-AI, show me the highest-rated black noise-cancelling headphones under ₹4000."`,
    desc: "Traditional UI requires clicking through 5 different menus to apply filters and sort. With our system, you type one natural sentence and instantly cross-reference all variables.",
  },
  {
    icon: <Laptop className="w-8 h-8 text-red-500" />,
    prompt: `"SG-AI, should I buy Laptop A or Laptop B for basic web browsing and Netflix?"`,
    desc: "Standard 'Compare' buttons just put confusing spec sheets side-by-side. SG-AI acts as your personal tech expert, explaining which specs actually matter for your needs so you don't overspend.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors flex flex-col items-center justify-center p-6 sm:p-12">
      {/* Hero Section */}
      <div className="max-w-4xl text-center space-y-6 mt-8">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 pb-2">
          The Future of E-Commerce
          <br />
          developed by Saurabh Galgale
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Stop clicking checkboxes. Experience shopping powered by intelligent
          context, real human intent, and SG-AI.
        </p>
        <div className="pt-6">
          <Link
            to="/store"
            className="inline-block px-10 py-5 bg-blue-900 hover:bg-blue-800 text-lg font-bold rounded-full shadow-xl transition-all hover:scale-105 hover:shadow-blue-500/25"
          >
            Visit the SG-AI Store
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl w-full pb-20">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            <div className="mb-6 bg-gray-50 dark:bg-gray-900 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner">
              {f.icon}
            </div>

            {/* Styled to look like a user prompt/chat bubble */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-xl mb-6">
              <h3 className="text-lg font-bold italic text-gray-800 dark:text-gray-200">
                {f.prompt}
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed flex-1">
              <span className="font-semibold text-gray-900 dark:text-gray-100 uppercase text-xs tracking-wider mb-2 block">
                The AI Advantage
              </span>
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
