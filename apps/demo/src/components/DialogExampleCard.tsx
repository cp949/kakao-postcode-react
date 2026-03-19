import type { KakaoPostcodeCompleteEvent } from "@cp949/kakao-postcode-react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { AddressSearchDialog } from "./AddressSearchDialog";
import { ExampleResultCard } from "./ExampleResultCard";

export function DialogExampleCard() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<KakaoPostcodeCompleteEvent | null>(null);

  return (
    <Stack spacing={2}>
      <Card
        sx={{
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,248,255,0.92) 100%)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.25, md: 3 } }}>
          <Stack spacing={3}>
            <Stack spacing={1.5}>
              <Typography variant="overline" color="primary.main" sx={{ letterSpacing: "0.16em" }}>
                실행 예제
              </Typography>
              <Typography variant="h5">Dialog 예제</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
                주소 검색 Dialog를 열고 주소를 고르면, 선택 결과를 호출자 화면까지 바로 되돌리는
                가장 짧은 연결 흐름만 보여줍니다.
              </Typography>
            </Stack>

            <Box
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 4,
                border: "1px solid rgba(206, 220, 243, 0.9)",
                background:
                  "linear-gradient(135deg, rgba(35, 104, 255, 0.08), rgba(255,255,255,0.7) 45%, rgba(255, 138, 76, 0.08))",
              }}
            >
              <Stack spacing={2}>
                <Stack spacing={0.75}>
                  <Typography variant="subtitle1">한 번의 선택으로 호출자 상태까지 연결</Typography>
                  <Typography variant="body2" color="text.secondary">
                    선택이 끝나면 Dialog가 닫히고, 결과 카드가 즉시 갱신됩니다.
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
                  <Button variant="contained" size="large" onClick={() => setOpen(true)}>
                    주소 검색 열기
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    시작 쿼리는 `판교역`으로 넣어두어 바로 동작을 확인할 수 있습니다.
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              divider={<Divider flexItem orientation="vertical" sx={{ display: { xs: "none", md: "block" } }} />}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Trigger
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  MUI Dialog + `KakaoPostcodeEmbed`
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Result
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  선택 결과를 부모 상태에 저장
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <ExampleResultCard title="호출자 결과" result={result} />

      <AddressSearchDialog
        open={open}
        onClose={() => setOpen(false)}
        onComplete={(event) => {
          setResult(event);
          setOpen(false);
        }}
      />
    </Stack>
  );
}
