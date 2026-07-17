import { Github, Mail } from "lucide-react";

export default function Home() {
  return (
    <div className="py-12">
      <section className="space-y-3">
        <h1 className="font-serif text-3xl font-semibold text-gray-900">
          Surya Chitti
        </h1>
        <p className="text-base text-gray-600 leading-relaxed max-w-lg">
          Mathematics and neural networks.
        </p>
        <div className="flex items-center gap-5 pt-1 text-sm text-gray-400">
          <a href="mailto:suryachitti216@gmail.com" className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
            <Mail className="h-3.5 w-3.5" /> Email
          </a>
          <a href="https://github.com/codechitti216" className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
            <Github className="h-3.5 w-3.5" /> GitHub
          </a>
        </div>
      </section>
    </div>
  );
}
