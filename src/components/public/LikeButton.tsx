"use client";

import { useState } from "react";

export function LikeButton({ slug, initialLikes }: { slug: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  async function toggle() {
    if (liked) return;
    setLiked(true);
    setLikes((n) => n + 1);
    try {
      await fetch(`/api/productos/${slug}/like`, { method: "POST" });
    } catch {
      setLiked(false);
      setLikes((n) => n - 1);
    }
  }

  return (
    <button
      onClick={toggle}
      className="ml-auto flex items-center gap-2 rounded-full border border-ink/14 bg-white px-4 py-2.5 text-[13.5px] text-ink"
    >
      <span style={{ color: liked ? "#D08F94" : "#4A3F3B" }} className="text-[15px]">
        ♥
      </span>
      {likes} personas
    </button>
  );
}
