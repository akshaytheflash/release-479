import { Fragment, type ReactNode } from "react";

/**
 * Renders a translated sentence that contains {placeholders}, replacing each
 * placeholder with a React node (a link, a bold figure, a code span). The
 * placeholders live inside the single catalog string, so translators keep the
 * word order of the whole sentence.
 */
export default function RichText({
  template,
  values,
}: {
  template: string;
  values: Record<string, ReactNode>;
}) {
  const parts = template.split(/(\{\w+\})/g);
  return (
    <>
      {parts.map((part, index) => {
        const match = /^\{(\w+)\}$/.exec(part);
        if (match && values[match[1]] !== undefined) {
          return <Fragment key={index}>{values[match[1]]}</Fragment>;
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}
