import { Fragment } from "react";

/** Renders the answer: **bold** becomes strong text, [1] becomes a citation mark. */
export default function AnswerText({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((paragraph) => paragraph.trim());
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="answer-text">
          {paragraph.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((part, at) => {
            if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={at}>{part.slice(2, -2)}</strong>;
            if (/^\[\d+\]$/.test(part)) return <span key={at} className="cite">{part}</span>;
            return <Fragment key={at}>{part}</Fragment>;
          })}
        </p>
      ))}
    </>
  );
}
