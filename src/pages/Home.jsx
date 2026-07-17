import { Github, Mail } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-12 py-8">

      <section className="space-y-3">
        <h1 className="font-serif text-3xl font-semibold text-gray-900">
          Surya Chitti
        </h1>
        <p className="text-base text-gray-600 leading-relaxed max-w-xl">
          Mathematics and machine learning. Building things with neural networks
          and documenting what I find along the way.
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

      <section className="space-y-2 border-t border-gray-100 pt-8">
        <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
          This site is my notebook. I use it to organize what I&apos;m learning
          and to have a place I can come back to when I need to remember how
          something works. It&apos;s public because that keeps me honest.
        </p>
        <p className="text-sm text-gray-400">
          It&apos;s mostly empty right now. That will change.
        </p>
      </section>

    </div>
  );
}
