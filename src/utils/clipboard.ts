function legacyClipboardCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

export async function writeToClipboard(text: string) {
  // Run the fallback while the click's user-activation window is definitely open.
  const fallbackCopied = legacyClipboardCopy(text);

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    if (!fallbackCopied) throw new Error("Clipboard copy failed");
  }
}
