import { useRef, useState } from "react";
import toast from "react-hot-toast";

function CodeBlock({ children, ...props }) {
  const codeRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // const codeText = codeRef.current?.innerText || "";

    const codeText = codeRef.current?.textContent || "";
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      toast.success("Copied!");
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="codeBlockWrapper">
      <button className="copyBtn" onClick={handleCopy} aria-label="Copy code">
        <i className={copied ? "fa-solid fa-check" : "fa-regular fa-copy"}></i>
      </button>
      <pre ref={codeRef} {...props}>
        {children}
      </pre>
    </div>
  );
}

export default CodeBlock;
