/** Public profiles run edge to edge on a phone; each page brings its own header. */
export default function ProfileLayout({ children }: LayoutProps<"/[username]">) {
  return <div className="flex flex-1 flex-col">{children}</div>;
}
