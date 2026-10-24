// Workbench prose: the MDX component map shared by case studies and posts, so
// their text reads in Workbench's type. Every element gets its own class from
// prose.module.scss; nothing here styles anything outside the MDX it renders.
import { EMIcon } from "@/resources/EMIcon";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import Link from "next/link";
import { Children, type ComponentPropsWithoutRef, type ReactNode, isValidElement } from "react";
import { CopyLink } from "./CopyLink";
import { Figures } from "./Figures";
import { VideoEmbed } from "./VideoEmbed";
import { isImage, mediaSize } from "./media";
import styles from "./prose.module.scss";
import { anchorId } from "./source";

type Props = { children?: ReactNode };

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

// Headings: the copy key sits beside the heading, not inside it, so the
// heading's accessible name stays its own text.
function heading(level: 2 | 3 | 4) {
  const Tag = `h${level}` as const;
  const Component = ({ children }: Props) => {
    const text = textOf(children);
    const id = anchorId(text);
    return (
      <div className={`${styles.headRow} ${styles[`row${level}`]}`}>
        <Tag id={id} className={styles[`h${level}`]}>
          {children}
        </Tag>
        <CopyLink id={id} label={text} />
      </div>
    );
  };
  Component.displayName = Tag;
  return Component;
}

function Strong({ children }: Props) {
  return <strong className={styles.strong}>{children}</strong>;
}

// No italics in Workbench: emphasis is carried by weight.
function Em({ children }: Props) {
  return <em className={styles.em}>{children}</em>;
}

function Paragraph({ children }: Props) {
  const parts = Children.toArray(children).filter(
    (part) => !(typeof part === "string" && part.trim() === ""),
  );
  const only = parts.length === 1 ? parts[0] : null;
  if (only && isValidElement(only)) {
    // A Markdown image alone on its line becomes a print, not a paragraph.
    if (only.type === Img || only.type === MediaPrint) return only;
    const text = textOf(only).trim();
    if (only.type === Strong) {
      // "**Stack:**" or "**Instagram**" introduces what follows; a longer line
      // in bold on its own is the line that matters: a note on the bench.
      if (text.endsWith(":") || text.split(/\s+/).length <= 3)
        return <p className={styles.label}>{text.replace(/:\s*$/, "")}</p>;
      return <p className={styles.note}>{text}</p>;
    }
    if (only.type === Em) return <p className={styles.kicker}>{text}</p>;
  }
  return <p className={styles.p}>{children}</p>;
}

function List({ children }: Props) {
  return <ul className={styles.ul}>{children}</ul>;
}

function OrderedList({ children, start }: Props & { start?: number }) {
  return (
    <ol className={styles.ol} start={start}>
      {children}
    </ol>
  );
}

function Item({ children }: Props) {
  return <li className={styles.li}>{children}</li>;
}

function A({ href = "", children }: ComponentPropsWithoutRef<"a">) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={styles.a}>
        {children}
      </Link>
    );
  }
  const external = !href.startsWith("#");
  return (
    <a
      href={href}
      className={styles.a}
      {...(external && !href.startsWith("mailto:")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children}
    </a>
  );
}

/** A still image laid on the page as a print: behind a hairline, a caption under it. */
export function MediaPrint({
  src,
  alt = "",
  caption,
}: {
  src: string;
  alt?: string;
  caption?: ReactNode;
}) {
  if (!src) return null;
  const { w, h } = mediaSize(src);
  const portrait = h > w * 1.05;
  const square = !portrait && w <= h * 1.05;
  return (
    <figure
      className={`${styles.figure} ${portrait ? styles.portrait : ""} ${square ? styles.square : ""}`}
      data-reveal=""
    >
      <span className={styles.frame}>
        {isImage(src) ? (
          <Image
            src={src}
            width={w}
            height={h}
            alt={alt}
            sizes={
              portrait
                ? "(min-width: 720px) 420px, 88vw"
                : square
                  ? "(min-width: 720px) 560px, 92vw"
                  : "(min-width: 1024px) 700px, 92vw"
            }
          />
        ) : null}
      </span>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}

function Img({ src = "", alt = "" }: { src?: string; alt?: string }) {
  return <MediaPrint src={src} alt={alt} />;
}

function Blockquote({ children }: Props) {
  return <blockquote className={styles.quote}>{children}</blockquote>;
}

function Rule() {
  return <hr className={styles.hr} />;
}

function InlineCodeText({ children }: Props) {
  return <code className={styles.code}>{children}</code>;
}

// A fenced block. With a language it reads as code; without one (a pipeline
// written with arrows, say) it reads as a line on a dark strip.
function Pre({ children }: Props) {
  const child = Children.toArray(children)[0];
  const props = isValidElement<{ className?: string; children?: ReactNode }>(child)
    ? child.props
    : { children };
  const language = props.className?.replace(/^language-/, "");
  return (
    <pre className={`${styles.pre} ${language ? styles.preCode : ""}`}>
      <code>{textOf(props.children).replace(/\n$/, "")}</code>
    </pre>
  );
}

// Tables: native ones (from Markdown) and the <Table data={...}> some cases use.
function TableWrap({ children }: Props) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>{children}</table>
    </div>
  );
}

function DataTable({
  data,
}: {
  data?: { headers: { content: ReactNode; key: string }[]; rows: ReactNode[][] };
}) {
  if (!data) return null;
  return (
    <TableWrap>
      <thead>
        <tr>
          {data.headers.map((head) => (
            <th key={head.key} scope="col">
              {head.content}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row) => (
          <tr key={textOf(row)}>
            {row.map((cell, i) => (
              <td key={data.headers[i]?.key ?? i}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </TableWrap>
  );
}

/** The tools of a case, as plain tags. */
function TechStack({ data = "" }: { data?: string }) {
  const items = data
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    <ul className={styles.stack} aria-label="Stack">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

// The <Grid> and <Card> some cases use for a grid of figures: index cards
// here. Their spacing props are ignored; the cards set their own.
function Grid({ children }: Props) {
  return <div className={styles.cards}>{children}</div>;
}

function Card({ children }: Props) {
  return <div className={styles.card}>{children}</div>;
}

function Column({ children }: Props) {
  return <div className={styles.col}>{children}</div>;
}

function Row({ children }: Props) {
  return <div className={styles.row}>{children}</div>;
}

function Text({ children, variant = "" }: Props & { variant?: string }) {
  const kind = variant.startsWith("label")
    ? styles.cardLabel
    : variant.startsWith("heading") || variant.startsWith("display")
      ? styles.cardTitle
      : styles.cardText;
  return <span className={kind}>{children}</span>;
}

// Literal <img> tags in MDX skip the component map (MDX maps only Markdown
// syntax), so this renames them to <Img> before compiling: every image in a
// case reads as a print, lazy and sized, without editing the case text.
type MdxNode = { type: string; name?: string | null; children?: MdxNode[] };
function printsForImgTags() {
  const walk = (node: MdxNode) => {
    if (
      (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
      node.name === "img"
    ) {
      node.name = "Img";
    }
    for (const child of node.children ?? []) walk(child);
  };
  return (tree: MdxNode) => walk(tree);
}

const components = {
  h1: heading(2),
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  h5: heading(4),
  h6: heading(4),
  p: Paragraph,
  strong: Strong,
  em: Em,
  ul: List,
  ol: OrderedList,
  li: Item,
  a: A,
  img: Img,
  Img,
  blockquote: Blockquote,
  hr: Rule,
  code: InlineCodeText,
  pre: Pre,
  table: TableWrap,
  Table: DataTable,
  Media: MediaPrint,
  YouTubeEmbed: VideoEmbed,
  ResultsStats: Figures,
  TechStack,
  Grid,
  Card,
  Column,
  Row,
  Text,
};

export function Prose({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{ mdxOptions: { remarkPlugins: [printsForImgTags] } }}
    />
  );
}

/** Erick's monogram, laid at the end of an article as its last mark. */
export function EndMark() {
  return (
    <div className={styles.end} aria-hidden="true">
      <span className={styles.endMark}>
        <EMIcon />
      </span>
    </div>
  );
}
