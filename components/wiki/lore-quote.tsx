export default function LoreQuote({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
      <blockquote className="text-sm italic leading-relaxed text-zinc-600">
        <span className="text-2xl leading-none text-amber-400">&ldquo;</span>
        {text}
        <span className="text-2xl leading-none text-amber-400">&rdquo;</span>
      </blockquote>
    </div>
  );
}
