import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

const exampleCode = `import { useState } from "react";
import type {
  KakaoPostcodeCloseState,
  KakaoPostcodeCompleteEvent,
} from "@cp949/kakao-postcode-react";
import { Box, Button, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
import {
  KakaoPostcodeEmbed,
} from "@cp949/kakao-postcode-react";

const IFRAME_HEIGHT = 470;

export function AddressSearchDialogExample() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<KakaoPostcodeCompleteEvent | null>(null);
  const title = "주소 검색";

  const handleDialogClose = () => {
    setOpen(false);
  };

  const handleProviderClose = (state: KakaoPostcodeCloseState) => {
    if (state !== "COMPLETE_CLOSE") {
      setOpen(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>주소 검색 열기</Button>

      <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="xs">
        <DialogTitle sx={{ py: 1.5, pl: 2, pr: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
            <Typography component="span" variant="h6">
              {title}
            </Typography>
            <Button size="small" onClick={handleDialogClose}>
              닫기
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: IFRAME_HEIGHT, p: 0 }}>
          <KakaoPostcodeEmbed
            q="판교역"
            autoClose
            height={IFRAME_HEIGHT}
            width="100%"
            style={{ width: "100%" }}
            loadingFallback={<Typography sx={{ p: 2 }}>{\`\${title}...\`}</Typography>}
            errorFallback={
              <Typography color="error" sx={{ p: 2 }}>
                주소 검색을 불러오지 못했습니다.
              </Typography>
            }
            onClose={handleProviderClose}
            onComplete={(event) => {
              setResult(event);
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {result ? (
        <div>
          <div>우편번호: {result.raw.zonecode}</div>
          <div>기본 주소: {result.raw.address}</div>
          <div>정규화 주소: {result.normalized.fullRoadAddress}</div>
        </div>
      ) : null}
    </>
  );
}`;

export function ExampleCodeCard() {
  return (
    <Card
      variant="outlined"
      sx={{
        overflow: "hidden",
        background:
          "linear-gradient(180deg, rgba(15,23,40,0.98), rgba(17,31,55,0.98))",
      }}
    >
      <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
        <Stack spacing={2}>
          <Stack spacing={1}>
            <Typography
              variant="overline"
              sx={{ letterSpacing: "0.16em", color: "#8bb3ff" }}
            >
              핵심 코드
            </Typography>
            <Typography variant="h5" sx={{ color: "#f4f8ff" }}>
              Dialog 흐름을 그대로 옮긴 예제
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(221, 233, 250, 0.72)" }}
            >
              실제 demo와 거의 동일한 예제 코드 문자열입니다. Dialog에서
              검색하고, 선택 결과를 호출자에게 반환하는 핵심 흐름만 남겼습니다.
            </Typography>
          </Stack>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
          <Box
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid rgba(139, 179, 255, 0.16)",
              backgroundColor: "#0a1220",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1.25,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.02)",
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#ff7b72",
                }}
              />
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#f2cc60",
                }}
              />
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#56d364",
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: "rgba(210, 223, 244, 0.72)", ml: 0.5 }}
              >
                AddressSearchDialogExample.tsx
              </Typography>
            </Box>
            <Typography
              component="pre"
              sx={{
                m: 0,
                p: 2.5,
                overflowX: "auto",
                color: "#e9f1fb",
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              <code>{exampleCode}</code>
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
