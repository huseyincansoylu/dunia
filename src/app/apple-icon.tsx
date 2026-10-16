import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS rounds the corners itself, so the background runs full-bleed.
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><clipPath id="w"><circle cx="32" cy="32" r="21.5"/></clipPath></defs><circle cx="32" cy="32" r="27" fill="#0b4f6c" stroke="#ffffff" stroke-width="7"/><g clip-path="url(#w)"><path d="M0 34.1q8 -4.5 16 0t16 0t16 0t16 0V64H0Z" fill="#f4a62a"/></g></svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b4f6c",
        }}
      >
        <img
          src={`data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`}
          width={120}
          height={120}
          alt=""
        />
      </div>
    ),
    { ...size }
  );
}
