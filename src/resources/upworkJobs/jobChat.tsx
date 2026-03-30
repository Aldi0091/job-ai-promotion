import * as React from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { httpJson } from "../../utils/http";

type JobChatProps = {
  jobId: number;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const starterPrompts = [
  "How well do I fit this job?",
  "What should I highlight in my proposal?",
  "What are the main risks or gaps?",
  "Write 5 smart questions for the client.",
];

function normalizePlainText(text: string) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function JobChat({ jobId }: JobChatProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);
  const assistantContentRefs = React.useRef<Record<number, HTMLDivElement | null>>({});

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const markCopied = (key: string) => {
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((current) => (current === key ? null : current));
    }, 1600);
  };

  const copyRichMessage = async (idx: number, markdown: string) => {
    const ref = assistantContentRefs.current[idx];
    const plainText = normalizePlainText(ref?.innerText || markdown);
    const html = String(ref?.innerHTML || "").trim();

    try {
      if (html && typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": new Blob([plainText], { type: "text/plain" }),
            "text/html": new Blob([html], { type: "text/html" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }
      markCopied(`rich-${idx}`);
    } catch (e) {
      console.error("Rich clipboard copy failed", e);
      try {
        await navigator.clipboard.writeText(plainText || markdown);
        markCopied(`rich-${idx}`);
      } catch (fallbackError) {
        console.error("Plain clipboard fallback failed", fallbackError);
      }
    }
  };

  const copyMarkdownMessage = async (idx: number, markdown: string) => {
    try {
      await navigator.clipboard.writeText(markdown);
      markCopied(`md-${idx}`);
    } catch (e) {
      console.error("Markdown clipboard copy failed", e);
    }
  };

  const sendMessage = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const data = await httpJson(`/api/upwork-jobs/${jobId}/chat`, {
        method: "POST",
        body: JSON.stringify({ messages: nextMessages }),
      });

      const answer = String(data?.answer || "").trim() || "No answer returned.";
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (e: any) {
      setError(e?.message || "Chat failed");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
        Job Chat
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ask about this specific job using its description and your MY_EXPERIENCE profile.
      </Typography>

      {messages.length === 0 && (
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
          {starterPrompts.map((prompt) => (
            <Button
              key={prompt}
              variant="outlined"
              size="small"
              onClick={() => sendMessage(prompt)}
              disabled={loading}
            >
              {prompt}
            </Button>
          ))}
        </Stack>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
          maxHeight: 440,
          overflowY: "auto",
          pr: 0.5,
          mb: 2,
        }}
      >
        {messages.map((message, idx) => {
          const isUser = message.role === "user";
          const richCopied = copiedKey === `rich-${idx}`;
          const mdCopied = copiedKey === `md-${idx}`;

          return (
            <Box
              key={`${message.role}-${idx}`}
              sx={{
                alignSelf: isUser ? "flex-end" : "flex-start",
                maxWidth: "88%",
                px: 1.5,
                py: 1.25,
                borderRadius: 2,
                bgcolor: isUser ? "action.selected" : "background.default",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
                sx={{ mb: 0.5 }}
              >
                <Typography variant="caption" sx={{ opacity: 0.6, display: "block" }}>
                  {isUser ? "You" : "AI"}
                </Typography>

                {!isUser && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Tooltip title={richCopied ? "Copied" : "Copy formatted"}>
                      <IconButton
                        size="small"
                        onClick={() => copyRichMessage(idx, message.content)}
                        sx={{ width: 28, height: 28 }}
                      >
                        {richCopied ? <CheckIcon fontSize="inherit" /> : <ContentCopyIcon fontSize="inherit" />}
                      </IconButton>
                    </Tooltip>

                    <Button
                      size="small"
                      variant={mdCopied ? "contained" : "outlined"}
                      onClick={() => copyMarkdownMessage(idx, message.content)}
                      sx={{ minWidth: 0, px: 1, py: 0.2, lineHeight: 1.2 }}
                    >
                      {mdCopied ? "Copied MD" : "MD"}
                    </Button>
                  </Stack>
                )}
              </Stack>

              {isUser ? (
                <Typography sx={{ whiteSpace: "pre-wrap" }}>{message.content}</Typography>
              ) : (
                <Box
                  ref={(node) => {
                    assistantContentRefs.current[idx] = node;
                  }}
                  sx={{
                    "& p": { my: 0.75 },
                    "& ul, & ol": { pl: 2.5, my: 0.75 },
                    "& pre": {
                      p: 1.25,
                      borderRadius: 1.5,
                      overflowX: "auto",
                      bgcolor: "action.hover",
                    },
                    "& code": {
                      fontFamily: "monospace",
                    },
                  }}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </Box>
              )}
            </Box>
          );
        })}

        {loading && (
          <Box
            sx={{
              alignSelf: "flex-start",
              px: 1.5,
              py: 1.25,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={16} />
              <Typography variant="body2">Thinking…</Typography>
            </Stack>
          </Box>
        )}

        <div ref={bottomRef} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={1} alignItems="flex-end">
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={8}
          placeholder="Ask something about this job..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <Button
          variant="contained"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          sx={{ minWidth: 110, height: 56 }}
        >
          Send
        </Button>
      </Stack>
    </Box>
  );
}
