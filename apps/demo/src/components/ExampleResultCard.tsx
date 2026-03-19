import type { KakaoPostcodeCompleteEvent } from "@cp949/kakao-postcode-react";
import { Card, CardContent, Divider, Stack, Typography } from "@mui/material";

type ExampleResultCardProps = {
  result: KakaoPostcodeCompleteEvent | null;
  title: string;
};

type ResultRowProps = {
  label: string;
  value: string;
};

function ResultRow({ label, value }: ResultRowProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={0.75}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, textAlign: { sm: "right" } }}>
        {value || "-"}
      </Typography>
    </Stack>
  );
}

export function ExampleResultCard({ result, title }: ExampleResultCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        background: result
          ? "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.98))"
          : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,249,253,0.98))",
      }}
    >
      <CardContent sx={{ p: { xs: 2.25, md: 2.5 } }}>
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="overline" color="primary.main" sx={{ letterSpacing: "0.14em" }}>
              Result state
            </Typography>
            <Typography variant="h6">{title}</Typography>
          </Stack>
          <Divider />
          {result ? (
            <Stack spacing={1.25}>
              <ResultRow label="우편번호" value={result.raw.zonecode} />
              <ResultRow label="기본 주소" value={result.raw.address} />
              <ResultRow label="정규화 주소" value={result.normalized.fullRoadAddress} />
            </Stack>
          ) : (
            <Stack spacing={0.75}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                아직 반환된 주소가 없습니다.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dialog에서 주소를 선택하면 호출자 결과가 여기 표시됩니다.
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
